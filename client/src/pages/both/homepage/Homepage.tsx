import React from "react";
import {Stack} from "@mui/material";
import Page from "../../Page";
import { useCurrentUser } from "../../../common/CurrentUserProvider";
import Typography from "@mui/material/Typography";
import AccountBalanceCard from "./AccountBalanceCard";
import OperationHoursCard from "./OperationHoursCard";
import UpcomingEventsCard from "./UpcomingEventsCard";
import IncompleteTrainingsCard from "./IncompleteTrainingsCard";
import ExpiringSoonCard from "./ExpiringSoonCard";
import AnnouncementsCard from "./AnnouncementsCard";
import { useNavigate } from "react-router-dom";
// import RequestWrapper from "../../../common/RequestWrapper";
// import { useQuery } from "@apollo/client";
// import { Announcement, GET_ANNOUNCEMENTS } from "../../../queries/getAnnouncements";
//import UpcomingEventsCard from "./GoogleCalendarAPI";

const Homepage: React.FC = () => {
    const currentUser = useCurrentUser();
    const welcomeMsg = "Welcome, " + currentUser.firstName;
    const navigate = useNavigate();

    return (
        <Page title={welcomeMsg} maxWidth={"1250px"}>
                <Typography variant="h5">Dashboard</Typography>
                <Stack direction={"row"} justifyContent={"space-between"} marginTop={2}>
                    <Stack direction={"column"} spacing={5}>
                        <AccountBalanceCard />
                        <ExpiringSoonCard />
                        <IncompleteTrainingsCard onClick={() => navigate("/maker/training/")}/>
                    </Stack>

                    <Stack direction={"column"} spacing={5}>
                        <OperationHoursCard />
                        <AnnouncementsCard/>
                    </Stack>

                    <Stack direction={"column"} spacing={15}>
                        <UpcomingEventsCard />
                    </Stack>
                </Stack>
        </Page>
    );
};

export default Homepage;