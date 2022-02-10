import React from "react";
import Page from "../../Page";
import {Button, Divider, InputAdornment, Stack, TextField, Typography} from "@mui/material";
import Logs from "../../../test_data/Logs";
import PageSectionHeader from "../../../common/PageSectionHeader";
import AuditLogRow from "../../../common/AuditLogRow";
import {DateRange} from "@mui/icons-material";
import {DatePicker} from "@mui/lab";


interface LogPageProps {}

export default function LogPage({}: LogPageProps) {

    return (
        <Page title="Logs">

            <PageSectionHeader>Audit Logs</PageSectionHeader>

            <TextField  placeholder="Search for Events" size="small" />
            <TextField  placeholder="User" size="small" />
            <TextField label="Start date" type="date" InputLabelProps={{ shrink: true }}/>
            <TextField label="End Date" type="date" InputLabelProps={{ shrink: true }}/>
            <Button>Search</Button>

            <pre ></pre>
            <Stack direction="row" alignItems="center" spacing={4}>

                <Typography variant="body1" width={150} fontWeight={"bold"}>
                    Date
                </Typography>
                <Typography variant="body1" width={150} fontWeight={"bold"}>
                    User
                </Typography>
                <Typography variant="body1" width={150} fontWeight={"bold"}>
                    Event Type
                </Typography>
                <Typography variant="body1" width={150} fontWeight={"bold"}>
                    Description
                </Typography>

            </Stack>
            <Stack divider={<Divider flexItem />} mt={2}>
                {Logs.map((log) => (
                    <AuditLogRow
                        log={log}
                        key={log.id}
                    />
                ))}
            </Stack>
        </Page>
    );
}