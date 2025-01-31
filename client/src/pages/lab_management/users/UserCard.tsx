import React from "react";
import { Avatar, Card, CardActionArea, Chip, Stack, Typography, useTheme } from "@mui/material";
import { PartialUser } from "../../../queries/getUsers";
import PrivilegeChip from "./PrivilegeChip";

interface UserCardProps {
  user: PartialUser;
  onClick: () => void;
}

export default function UserCard({ user, onClick }: UserCardProps) {
  const theme = useTheme();

  const CARD_COLOR = ((
    user.activeHold
  ) ? ((localStorage.getItem("themeMode") == "dark") ? "#382a29" : "#f1d1ce")
    : null);

    const BORDER = ((
      user.activeHold
    ) ? `2px solid ${theme.palette.error.main}`
      : "inherit");

  return (
    <Card elevation={2} sx={{ mr: 2, mb: 2, background: CARD_COLOR, border: BORDER }}>
      <CardActionArea sx={{ p: 2, height: "100%" }} onClick={onClick}>
        <Stack alignItems="center" spacing={1.5} height="100%">
          <Avatar
            alt=""
            src={
              "https://t4.ftcdn.net/jpg/00/64/67/63/240_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg"
            }
            sx={{ width: 80, height: 80 }}
          />

          <Typography
            variant="body1"
            fontWeight={500}
            width={120}
            textAlign="center"
            lineHeight={1.25}
            flex={1}
          >
            {`${user.firstName} ${user.lastName}`}
            <br />
            <Typography
              variant="caption"
              fontWeight={200}
              width={120}
              textAlign="center"
              lineHeight={1}
              flex={1}
            >
              {`${user.ritUsername}`}
            </Typography>
          </Typography>

          <PrivilegeChip privilege={user.privilege} />
        </Stack>
      </CardActionArea>
    </Card>
  );
}
