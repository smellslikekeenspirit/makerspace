import Page from "../../Page";
import {Button, Grid, Stack, Typography} from "@mui/material";
import {useCallback} from "react";
import {useNavigate} from "react-router-dom";

export default function LogoutPromptPage() {


    const logout = useCallback(() => {
        console.log("Logging out...")
        fetch("http://localhost:3000/logout", {
            mode: 'cors',
            method: 'POST',
            credentials: 'include',
            redirect: 'follow'
        })
            .then(() => {
                console.log("logged out")

                //reload is needed to force logout user, in the future should make this happen in a better way
                //possibly redirect to login page?
                window.location.reload();

            })
            .catch(function(err) {
                console.info(err);
            });
    }, []);


    return (
        <Page title="Logout" maxWidth="1250px">


            <Typography variant={"h5"} style={{ color: "grey" }}>Are you sure you would like to logout?</Typography>

            <Button onClick={logout}>
                Logout
            </Button>


        </Page>
    );
}