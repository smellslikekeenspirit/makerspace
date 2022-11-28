import React, { useCallback, useEffect } from "react";
import { Button } from "@mui/material";
import { gql, useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { GET_ROOM } from "../../../queries/getRooms";
import { SWIPE_INTO_ROOM } from "../../../queries/swipes";

const SWIPE_START_CHAR = ";";
const SWIPE_END_CHAR = "?";

let readingSwipe = false;
let swipeBuffer: string[] = [];

interface CardReaderProps {
  setLoadingUser: (l: boolean) => void;
  onCardError: () => void;
}

export default function CardReader({
  setLoadingUser,
  onCardError,
}: CardReaderProps) {
  const { id } = useParams<{ id: string }>();
  const [swipeIntoRoom] = useMutation(SWIPE_INTO_ROOM);

  const handleSwipe = useCallback(
    (universityID: string) => {
      setLoadingUser(true);
      swipeIntoRoom({
        variables: { roomID: id, universityID },
        refetchQueries: [{ query: GET_ROOM, variables: { id } }],
        onCompleted: (data) => {
          setLoadingUser(false);
          if (!data?.swipeIntoRoom?.id) onCardError();
        },
      });
    },
    [id, setLoadingUser, swipeIntoRoom, onCardError]
  );

  const handleKeyDown = useCallback(
    ({key}) => {
      if (readingSwipe) {
        swipeBuffer.push(key);
      }

      if (key === SWIPE_START_CHAR) {
        readingSwipe = true;
        swipeBuffer = [];
      }

      if (key === SWIPE_END_CHAR) {
        readingSwipe = false;

        const uidString = swipeBuffer.slice(0, 9).join("");
        handleSwipe(uidString);
      }
    },
    [handleSwipe]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSwipe]);

  return (
    <Button
      sx={{ mb: 0, ml: "auto !important" }}
      onClick={() => {
        const universityID = window.prompt("Enter university ID");
        if (universityID) handleSwipe(universityID);
      }}
    >
      Enter card manually
    </Button>
  );
}
