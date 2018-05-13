import React from "react";
import {Router, Route, Switch} from "react-router-dom";
import Homepage from "./components/Homepage";
import history from "./history"

const Routes = () => (
    <Router history={history}>
        <Switch>
            <Route path="/" component={Homepage}/>
        </Switch>
    </Router>
);

export default Routes;
