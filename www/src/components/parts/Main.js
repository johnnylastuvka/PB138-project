import React, {Component} from 'react';
import {get} from "../../utils/Api";
import * as PubSub from "pubsub-js";
import Rodal from "rodal";
import confirm from "../utils/confirm";

export default class Main extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            selectedMedium: props.selectedMedium ? props.selectedMedium : null,
            btnAddDisabled: props.btnAddDisabled ? props.btnAddDisabled : true,
            showCategory: props.showCategory ? props.showCategory : null,
            showSearch: props.showSearch ? props.showSearch : null,
            modalAdd: false,
        };
    }

    componentWillMount = function () {
        this._showSearch = PubSub.subscribe('search', this.showSearch.bind(this));
        this._showCategory = PubSub.subscribe('selectedCategory', this.showCategory.bind(this));
    };

    componentWillUnmount = function () {
        PubSub.unsubscribe(this._showSearch);
        PubSub.unsubscribe(this._showCategory);
    };

    showSearch = (msg, data) => {

        this.setState({
            showSearch: data,
        });

        if (data && data.searchText !== null && data.searchType !== null) {
            this.setState({
                btnAddDisabled: true,
                selectedMedium: null,
            });
        } else {

            if (!this.state.showCategory) {
                this.setState({
                    btnAddDisabled: true,
                    selectedMedium: null,
                });
            }
        }
    };

    showCategory = (msg, data) => {
        this.setState({
            showCategory: data.selectedCategory
        });

        if (data && data.selectedCategory) {
            this.setState({
                btnAddDisabled: false,
                selectedMedium: null,
            });
        } else {
            if (!this.state.showSearch) {
                this.setState({
                    btnAddDisabled: true,
                    selectedMedium: null,
                });
            }
        }
    };

    selectMedium(selectedMedium) {
        this.setState({selectedMedium});
    }

    componentDidMount() {
        this.reload();
    }

    reload = () => {
        /*
            We must download all data because API doesn't have methods like
            GET /api/category/all
            GET /api/record/all
            GET /api/record/$id
            GET /api/record/byCategory/$id etc.
         */
        get("/document").then(response => {
            if (response) {
                console.log(response);
            }
        });
    };

    toggleModalAdd = (modalIsOpen) => {

        if (modalIsOpen && this.state.btnAddDisabled) {
            return false;
        }

        this.setState({modalAdd: modalIsOpen});

        if (modalIsOpen) {
            // add right padding to body if scrollbar absent at page
            let scrollDiv = document.createElement("div");
            scrollDiv.className = "scrollbar-measure";
            document.body.appendChild(scrollDiv);
            let scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
            document.body.removeChild(scrollDiv);
            if (window.innerWidth > document.documentElement.clientWidth) {
                document.body.style.paddingRight = scrollbarWidth + "px";
            }
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
            document.body.style.paddingRight = "0px";
        }
    };

    removeMedium = () => {

        if (!this.state.selectedMedium) {
            return false;
        }

        confirm("Opravdu chcete smazat médium?").then(
            result => {
                console.log("Mažu");
            },
            result => {
                // `cancel` callback
            }
        );


    };

    render() {
        console.log(this.state);
        return (
            <div className={"main"}>
                <div className={"col-12 main__top-bar"}>
                    <div className={"row"}>
                        <div className={"col-lg-4"}>
                            <div
                                className={"main__top-bar__button " + (this.state.btnAddDisabled ? "disabled" : "")}
                                onClick={(e) => {this.toggleModalAdd(true)}}
                            >
                                <span className={"button-circle"}><i className={"fa fa-plus"}></i></span>
                                Přidat médium
                            </div>
                        </div>

                        <div className={"col-lg-4"}>
                            <div
                                className={"main__top-bar__button " + (!this.state.selectedMedium ? "disabled" : "")}
                                onClick={(e) => {this.removeMedium()}}
                            >
                                <span className={"button-circle"}><i className={"fa fa-minus"}></i></span>
                                Odebrat médium
                            </div>
                        </div>

                        <div className={"col-lg-4"}>
                            <div className={"main__top-bar__button " + (!this.state.selectedMedium ? "disabled" : "")}>
                                <span className={"button-circle"}><i className={"fa fa-angle-double-up"}></i></span>
                                Přesunout do jiné kategorie
                            </div>
                        </div>
                    </div>
                </div>

                <div className={"col-12 main__content"}>
                    {!this.state.showCategory && !this.state.showSearch ?
                        <h3 className={"main__content__info-title"}>Vyberte kategorii</h3>
                        : ""
                    }

                    {this.state.showCategory || this.state.showSearch ?
                        <div>
                            <h1>Nadpis</h1>
                            <table className={"main__content__table"}>
                                <thead>
                                    <tr>
                                        <th>Film 1</th>
                                        <th>Film 2</th>
                                        <th>Film 3</th>
                                        <th>Film 4</th>
                                        <th>Film 5</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className={"active"}>
                                        <td>Film 1</td>
                                        <td>Film 2</td>
                                        <td>Film 3</td>
                                        <td>Film 4</td>
                                        <td>Film 5</td>
                                    </tr>
                                    <tr className={"pointer"} onClick={(e) => {e.preventDefault(); this.selectMedium(1);}}>
                                        <td>Film 1</td>
                                        <td>Film 2</td>
                                        <td>Film 3</td>
                                        <td>Film 4</td>
                                        <td>Film 5</td>
                                    </tr>
                                    <tr>
                                        <td>Film 1</td>
                                        <td>Film 2</td>
                                        <td>Film 3</td>
                                        <td>Film 4</td>
                                        <td>Film 5</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        : ""}

                </div>

                <div className="modal-add">
                    <Rodal
                        visible={this.state.modalAdd}
                        onClose={() => this.toggleModalAdd(false)}
                        animation="slideUp"
                        closeOnEsc={true}
                    >
                        Text
                    </Rodal>
                </div>
            </div>
        )
    }
}