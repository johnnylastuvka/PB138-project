import React, {Component} from 'react';
import Header from "./parts/Header";
import Loading from "./utils/Loading";
import Main from "./parts/Main";
import SideBar from "./parts/SideBar";

export default class HomePage extends Component {

    render() {
        return (
            <div>
                <Loading show={false}/>
                <div className={"wrap"}>
                    <div className={"container"}>
                        <Header />

                        <div className={"row"}>
                            <div className={"col-md-3 sidebar"}>
                                <SideBar />
                            </div>
                            <div className={"col-md-9 content"}>
                                <Main />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}