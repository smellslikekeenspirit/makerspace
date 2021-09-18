import * as React from "react";
import LeftNav from "./LeftNav";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Page from "./pages/Page";
import { Box, CssBaseline } from "@mui/material";
import MakerEquipmentPage from "./pages/maker/MakerEquipmentPage";

export default function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <LeftNav />
        <Switch>
          <Route path="/maker/equipment">
            <MakerEquipmentPage />
          </Route>
          <Route path="/maker/training">
            <Page title="Training" />
          </Route>
          <Route path="/maker/materials">
            <Page title="Materials" />
          </Route>
          <Route path="/admin/equipment">
            <Page title="Equipment" />
          </Route>
          <Route path="/admin/training">
            <Page title="Training" />
          </Route>
          <Route path="/admin/materials">
            <Page title="Materials" />
          </Route>
          <Route path="/admin/reservations">
            <Page title="Reservations" />
          </Route>
          <Route path="/admin/storefront">
            <Page title="Storefront" />
          </Route>
          <Route path="/admin/people">
            <Page title="People" />
          </Route>
          <Route path="/admin/audit">
            <Page title="Audit Logs" />
          </Route>
        </Switch>
      </Box>
    </BrowserRouter>
  );
}
