import * as ModuleRepo from "../repositories/Training/ModuleRepository";
import { AnswerInput } from "../schemas/trainingModuleSchema";
import { ApolloContext } from "../context";
import { Privilege } from "../schemas/usersSchema";
import { createLog } from "../repositories/AuditLogs/AuditLogRepository";
import { getUsersFullName } from "./usersResolver";
import * as SubmissionRepo from "../repositories/Training/SubmissionRepository";
import { MODULE_PASSING_THRESHOLD } from "../constants";
import { TrainingModuleItem, TrainingModuleRow } from "../db/tables";
import * as EquipmentRepo from "../repositories/Equipment/EquipmentRepository";

const removeAnswersFromQuiz = (quiz: TrainingModuleItem[]) => {
  for (let item of quiz) {
    if (item.options) {
      for (let option of item.options) {
        delete option.correct;
      }
    }
  }
};

const TrainingModuleResolvers = {
  Query: {
    modules: async (
      _parent: any,
      args: any,
      { ifAuthenticated }: ApolloContext
    ) =>
      ifAuthenticated(async (user) => {
        let modules = await ModuleRepo.getModules();

        if (user.privilege === "MAKER")
          for (let module of modules) removeAnswersFromQuiz(module.quiz);

        return modules;
      }),

    module: async (
      _parent: any,
      args: { id: number },
      { ifAuthenticated }: ApolloContext
    ) =>
      ifAuthenticated(async (user) => {
        let module = await ModuleRepo.getModuleByID(args.id);

        if (user.privilege === "MAKER") removeAnswersFromQuiz(module.quiz);

        return module;
      })
  },

  TrainingModule: {
    equipment: async (
      parent: TrainingModuleRow,
      _: any,
      { ifAuthenticated }: ApolloContext
    ) =>
      ifAuthenticated(async (user) => {
        return EquipmentRepo.getEquipmentForModule(parent.id);
      })
  },

  Mutation: {
    createModule: async (
      _parent: any,
      args: { name: string },
      { ifAllowed }: ApolloContext
    ) =>
      ifAllowed([Privilege.MENTOR, Privilege.STAFF], async (user) => {
        const module = await ModuleRepo.addModule(args.name);

        await createLog(
          "{user} created the {module} module.",
          { id: user.id, label: getUsersFullName(user) },
          { id: module.id, label: module.name }
        );

        return module;
      }),

    updateModule: async (
      _parent: any,
      args: { id: number; name: string; quiz: object; reservationPrompt: object },
      { ifAllowed }: ApolloContext
    ) =>
      ifAllowed([Privilege.MENTOR, Privilege.STAFF], async (user) => {
        const module = await ModuleRepo.updateModule(
          args.id,
          args.name,
          args.quiz,
          args.reservationPrompt
        );

        await createLog(
          "{user} updated the {module} module.",
          { id: user.id, label: getUsersFullName(user) },
          { id: module.id, label: module.name }
        );
      }),

    deleteModule: async (
      _parent: any,
      args: { id: number },
      { ifAllowed }: ApolloContext
    ) =>
      ifAllowed([Privilege.MENTOR, Privilege.STAFF], async (user) => {
        const module = await ModuleRepo.archiveModule(args.id);

        await createLog(
          "{user} deleted the {module} module.",
          { id: user.id, label: getUsersFullName(user) },
          { id: module.id, label: module.name }
        );
      }),

    submitModule: async (
      _parent: any,
      args: { moduleID: number; answerSheet: AnswerInput[] },
      { ifAllowed }: ApolloContext
    ) => {
      return ifAllowed(
        [Privilege.MAKER, Privilege.MENTOR, Privilege.STAFF],
        async (user) => {
          const { quiz, name } = await ModuleRepo.getModuleByID(args.moduleID);

          if (quiz.length === 0)
            throw Error("Provided module has no questions");

          let correct = 0,
            incorrect = 0;

          for (let question of quiz) {
            if (
              question.type !== "CHECKBOXES" &&
              question.type !== "MULTIPLE_CHOICE"
            )
              continue;

            if (!question.options)
              throw Error(
                `Module Item ${question.id} of type ${question.type} has no options`
              );

            const correctOptions = question.options.filter(
              (option) => option.correct
            );

            const correctOptionIds = correctOptions.map((option) => option.id);

            const submittedItem = args.answerSheet.find(
              (item) => item.itemID === question.id
            );

            if (!submittedItem?.optionIDs) {
              incorrect++;
              continue;
            }

            const submittedOptionsSet = new Set(submittedItem.optionIDs);
            const correctOptionsSet = new Set(correctOptionIds);

            const areSetsEqual = (a: any, b: any) =>
              a.size === b.size && [...a].every((value) => b.has(value));

            if (areSetsEqual(submittedOptionsSet, correctOptionsSet)) correct++;
            else incorrect++;
          }

          const grade = (correct / (incorrect + correct)) * 100;

          SubmissionRepo.addSubmission(
            user.id,
            args.moduleID,
            grade >= MODULE_PASSING_THRESHOLD
          ).then(async (id) => {
            await createLog(
              `{user} submitted attempt of {module} with a grade of ${grade}.`,
              { id: user.id, label: getUsersFullName(user) },
              { id: args.moduleID, label: name }
            );
  
            return id;
          });
        }
      );
    },
  },
};

export default TrainingModuleResolvers;
