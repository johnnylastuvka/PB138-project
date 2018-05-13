import React, {Component} from 'react';
import {get, httpDelete} from "../../utils/Api";
import * as PubSub from "pubsub-js";
import Rodal from "rodal";
import confirm from "../utils/confirm";

export default class Main extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            output: null,
            selectedRecord: props.selectedRecord ? props.selectedRecord : null,
            btnAddDisabled: props.btnAddDisabled ? props.btnAddDisabled : true,
            showCategory: props.showCategory ? props.showCategory : null,
            showSearch: props.showSearch ? props.showSearch : null,
            modalAdd: false,
            modalMove: false,
        };
    }

    componentWillMount = function () {
        this._showSearch = PubSub.subscribe('search', this.showSearch.bind(this));
        this._showCategory = PubSub.subscribe('selectedCategory', this.showCategory.bind(this));
        this._addedCategory = PubSub.subscribe('addedCategory', this.addedCategory.bind(this));
    };

    componentWillUnmount = function () {
        PubSub.unsubscribe(this._showSearch);
        PubSub.unsubscribe(this._showCategory);
        PubSub.unsubscribe(this._addedCategory);
    };

    showSearch = (msg, data) => {

        this.setState({
            showSearch: data,
        });

        if (data && data.searchText !== null && data.searchType !== null) {
            this.setState({
                btnAddDisabled: true,
                selectedRecord: null,
            });
        } else {

            if (!this.state.showCategory) {
                this.setState({
                    btnAddDisabled: true,
                    selectedRecord: null,
                });
            }
        }
    };

    showCategory = (msg, data) => {
        this.setState({
            showCategory: data.selectedCategory
        });

        if (data && data.selectedCategory) {

            let output = [];
            let category = null;
            let attrCount = null;

            for (let row in this.state.data) {
                let categoryData = this.state.data[row].category;
                if (categoryData.$.name === data.selectedCategory) {
                    category = categoryData;
                }
            }

            if (category) {
                if (category.attributes && category.attributes.hasOwnProperty("0") &&
                    category.attributes[0].attribute && category.attributes[0].attribute.length > 0) {
                    attrCount = category.attributes[0].attribute.length;
                    output.push({attributes: category.attributes[0].attribute});
                }

                if (category.records && category.records.hasOwnProperty("0") &&
                    category.records[0].record && category.records[0].record.length > 0) {

                    let recordOutput = [];
                    for (let record in category.records[0].record) {
                        let recordData = category.records[0].record[record];
                        let recordRow = [];

                        for (let i = 0; i < attrCount; i++) {
                            if (recordData && recordData.attribute &&  recordData.attribute.hasOwnProperty(i))
                            {
                                recordRow.push(recordData.attribute[i]);
                            } else {
                                recordRow.push("");
                            }
                        }
                        recordOutput.push(recordRow);
                    }
                    output.push({records: recordOutput});
                }
            }

            this.setState({
                btnAddDisabled: false,
                selectedRecord: null,
                output: output
            });
        } else {
            if (!this.state.showSearch) {
                this.setState({
                    btnAddDisabled: true,
                    selectedRecord: null,
                });
            }
        }
    };

    addedCategory = (msg, data) => {
        this.reload();
    };

    selectRecord(selectedRecord) {
        this.setState({selectedRecord});
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
        get("/document/").then(response => {
            if (response) {

                let parseString = require('xml2js').parseString;
                let data = [];

                parseString(response.data, function (err, result) {
                    console.log(result);
                    if (result && result.library && result.library.category) {
                        for (let row in result.library.category) {
                            let category = result.library.category[row];
                            data.push({category});
                        }
                    }
                });

                this.setState({data});
            }
        });
    };

    toggleModalAdd = (modalIsOpen) => {

        if (modalIsOpen && this.state.btnAddDisabled) {
            return false;
        }

        this.setState({modalAdd: modalIsOpen});

        if (modalIsOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
    };

    toggleModalMove = (modalIsOpen) => {

        if (modalIsOpen && !this.state.selectedRecord) {
            return false;
        }

        this.setState({modalMove: modalIsOpen});

        if (modalIsOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
    };

    removeRecord = () => {

        if (!this.state.selectedRecord) {
            return false;
        }

        confirm("Opravdu chcete smazat médium?").then(
            result => {
                httpDelete("/record/" + this.state.selectedRecord).then(
                    response => {
                        if (response) {
                            this.reload();
                        }
                    }
                );
            },
            result => {
                // `cancel` callback
            }
        );
    };

    render() {
        console.log(this.state.output);

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
                                className={"main__top-bar__button " + (this.state.selectedRecord === null ? "disabled" : "")}
                                onClick={(e) => {this.removeRecord()}}
                            >
                                <span className={"button-circle"}><i className={"fa fa-minus"}></i></span>
                                Odebrat médium
                            </div>
                        </div>

                        <div className={"col-lg-4"}>
                            <div
                                className={"main__top-bar__button " + (this.state.selectedRecord === null ? "disabled" : "")}
                                onClick={(e) => {this.toggleModalMove(true)}}
                            >
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

                    {this.state.showCategory && this.state.output && this.state.output.length > 0 ?
                        <table className={"main__content__table"}>
                            <thead>
                                <tr>
                                    {this.state.output.hasOwnProperty("0") && this.state.output[0].attributes && this.state.output[0].attributes.map((data, index) => {
                                        return (
                                            <th key={index}>{data}</th>
                                        )}
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.output.hasOwnProperty("1") && this.state.output[1].records && this.state.output[1].records.map((data, index) => {
                                    return (
                                        <tr key={index} onClick={(e) => {e.preventDefault(); this.selectRecord(index);}} className={(this.state.selectedRecord === index ? "active" : "")}>
                                            {data.map((attributes, index) => {
                                                return (
                                                    <td key={index}>{attributes}</td>
                                                )}
                                            )}
                                        </tr>
                                    )}
                                )}
                            </tbody>
                        </table>
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

                <div className="modal-move">
                    <Rodal
                        visible={this.state.modalMove}
                        onClose={() => this.toggleModalMove(false)}
                        animation="slideUp"
                        closeOnEsc={true}
                    >
                        <h1>Přesunout médium do:</h1>

                        <select className={"margin-top--15"}>
                            <option>Test</option>
                        </select>

                        <div className={'rodal__confirm__buttons'}>
                            <span className={'rodal__confirm__btn'} onClick={() => this.moveRecord()}>Ok</span>
                            <span className={'rodal__confirm__btn rodal__confirm__btn--gray'} onClick={() => this.toggleModalMove(false)}>Zrušit</span>
                        </div>
                    </Rodal>
                </div>
            </div>
        )
    }
}