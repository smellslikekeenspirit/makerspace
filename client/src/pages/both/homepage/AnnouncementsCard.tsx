import {
    Card,
    Stack,
    Typography
} from "@mui/material";
import { useQuery } from "@apollo/client";
import { Announcement, GET_ANNOUNCEMENTS } from "../../../queries/announcementsQueries";
import RequestWrapper from "../../../common/RequestWrapper";
import Markdown from "react-markdown";
import { useEffect, useState } from "react";

export default function AnnouncementsCard() {
    const getAnnouncementsResult = useQuery(GET_ANNOUNCEMENTS);

    const [width, setWidth] = useState<number>(window.innerWidth);
    function handleWindowSizeChange() {
        setWidth(window.innerWidth);
    }
    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, []);
    const isMobile = width <= 768;


    return (
        <RequestWrapper
            loading={getAnnouncementsResult.loading}
            error={getAnnouncementsResult.error}
        >
            <Card elevation={2} sx={{ minWidth: 250, maxWidth: 400, height: 500, padding: 2, justifyContent: "space-between", border: 1, borderColor: "lightgrey", flexGrow: 1, overflowY: "scroll"  }}>
                <Stack direction={"column"} spacing={1}>
                    <Typography variant="h4">Announcements</Typography>
                    <Stack spacing={1}>
                        {getAnnouncementsResult.data?.getAllAnnouncements?.map((announcement: Announcement) => (
                            <Stack>
                                <Typography variant="h5" color={"darkorange"}>{announcement.title}</Typography>
                                <Typography variant="body1"><Markdown>{announcement.description}</Markdown></Typography>
                            </Stack>
                        ))}
                        {!getAnnouncementsResult.data?.getAllAnnouncements &&(
                            <Typography variant={"h5"} style={{ color: "grey" }}>No announcements!</Typography>
                        )}
                    </Stack>
                </Stack>
            </Card>
        </RequestWrapper>
    );
}

