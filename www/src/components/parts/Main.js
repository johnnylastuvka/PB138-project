import React, {Component} from 'react';
import {get, httpDelete, patch, put} from "../../utils/Api";
import * as PubSub from "pubsub-js";
import Rodal from "rodal";
import confirm from "../utils/confirm";
import modalAlert from "../utils/alert";

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
            moveDisabledCategories: ['DVD_hudební']
        };
    }

    componentWillMount = () => {
        this._showSearch = PubSub.subscribe('search', this.showSearch.bind(this));
        this._showCategory = PubSub.subscribe('selectedCategory', this.showCategory.bind(this));
        this._addedCategory = PubSub.subscribe('addedCategory', this.addedCategory.bind(this));
        this._removedCategory = PubSub.subscribe('removedCategory', this.removedCategory.bind(this));
    };

    componentWillUnmount = () => {
        PubSub.unsubscribe(this._showSearch);
        PubSub.unsubscribe(this._showCategory);
        PubSub.unsubscribe(this._addedCategory);
        PubSub.unsubscribe(this._removedCategory);
    };

    addedCategory = (msg, data) => {
        this.reload();
    };

    removedCategory = (msg, data) => {
        if (this.state.showCategory && data.categoryId === this.state.showCategory) {
            this.setState({showCategory: null});
        } else if (this.state.showSearch) {
            this.reload();
        }
    };

    showSearch = (msg, data) => {

        this.setState({
            showSearch: data,
        });

        if (data && data.searchText !== null && data.searchType !== null) {

            let output = null;

            if (data.searchType === 'categories') {
                output = this.generateOutput(null, data.searchText, null);
            } else if (data.searchType === 'attributes') {
                output = this.generateOutput(null, null, data.searchText);
            }

            this.setState({
                btnAddDisabled: true,
                selectedRecord: null,
                showCategory: null,
                output
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
            this.setState({
                btnAddDisabled: false,
                selectedRecord: null,
                showSearch: null,
                output: this.generateOutput(data.selectedCategory)
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

    generateOutput(byCategory, searchCategory = null, searchAttributes = null) {

        let outputTables = [];
        if (byCategory || searchCategory || searchAttributes) {

            for (let index in this.state.data) {

                if (this.state.data.hasOwnProperty(index)) {
                    let category = this.state.data[index].category;

                    if (category) {
                        let attrCount = 0;
                        let singleOutputTable = [];
                        let attributesSearchFoundRecord = false;

                        if (category.attributes && category.attributes.hasOwnProperty("0") &&
                            category.attributes[0].attribute && category.attributes[0].attribute.length > 0) {
                            attrCount = category.attributes[0].attribute.length;
                            singleOutputTable.push({attributes: category.attributes[0].attribute, name: category.$.name});
                        }

                        if (category.records && category.records.hasOwnProperty("0") &&
                            category.records[0].record && category.records[0].record.length > 0) {

                            let recordOutput = [];

                            for (let record in category.records[0].record) {
                                let attributesSearchFoundAttribute = false;
                                let recordData = category.records[0].record[record];
                                let recordRow = [];

                                for (let i = 0; i < attrCount; i++) {
                                    if (recordData && recordData.attribute && recordData.attribute.hasOwnProperty(i)) {

                                        recordRow.push(recordData.attribute[i]);

                                        if (searchAttributes && recordData.attribute[i].toLowerCase().includes(searchAttributes)) {
                                            attributesSearchFoundAttribute = true;
                                            attributesSearchFoundRecord = true;
                                        }

                                    } else {
                                        recordRow.push("");
                                    }
                                }

                                /*
                                    DVD_hudební is a special case of category
                                 */
                                let id = recordData.attribute[1];
                                if (category.$.name === 'DVD_hudební') {
                                    id = recordData.attribute[2];
                                }

                                if (!searchAttributes || attributesSearchFoundAttribute) {
                                    recordOutput.push({id, data: recordRow});
                                }
                            }

                            singleOutputTable.push({records: recordOutput});
                        }

                        // category detail has only one table
                        if ((byCategory && category.$.name === byCategory) ||
                            (searchCategory && category.$.name.toLowerCase().includes(searchCategory)) ||
                            (searchAttributes && attributesSearchFoundRecord)) {
                            outputTables.push(singleOutputTable);
                        }
                    }
                }

            }
        }

        return outputTables;
    };

    selectRecord(selectedRecord, recordCategory) {
        this.setState({selectedRecord: {selectedRecord, recordCategory}});
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

                parseString(response.data, (err, result) => {
                    if (result && result.library && result.library.category) {
                        for (let row in result.library.category) {
                            let category = result.library.category[row];
                            data.push({category});
                        }
                    }
                });

                this.setState({data});

                if (this.state.showCategory) {
                    PubSub.publish('selectedCategory', {selectedCategory: this.state.showCategory});
                } else if (this.state.showSearch) {
                    PubSub.publish('search', {...this.state.showSearch});
                }

            }
        });
    };

    toggleModalAdd = (modalIsOpen) => {
        document.getElementById("newRecordName").value = '';

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

        if (this.state.moveDisabledCategories.indexOf(this.state.selectedRecord.recordCategory) !== -1) {
            modalAlert("Bohužel, média z této kategorie nelze přesouvat do jiných kategorií.");
            return false;
        }

        if (this.state.data) {
            let categories = [];
            let data = this.state.data;

            for (let row in data) {
                if (data.hasOwnProperty(row)) {
                    if (data[row].category.$.name !== this.state.selectedRecord.recordCategory &&
                        this.state.moveDisabledCategories.indexOf(data[row].category.$.name) === -1) {
                        categories.push({name: data[row].category.$.name});
                    }
                }
            }

            this.setState({modalMove: modalIsOpen, modalMoveCategories: categories});
        }


        if (modalIsOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
    };

    removeRecord = () => {

        if (!this.state.selectedRecord || !this.state.selectedRecord.selectedRecord) {
            return false;
        }

        confirm("Opravdu chcete smazat médium?").then(
            result => {
                httpDelete("/record/" + encodeURIComponent(this.state.selectedRecord.selectedRecord)).then(
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

    moveRecord = () => {

        let nameOfNewCategory = document.getElementById("changeRecordCategorySelect").value;

        patch("/record/"+ encodeURIComponent(this.state.selectedRecord.selectedRecord) +"/category/" + encodeURIComponent(nameOfNewCategory)).then(
            response => {
                if (response) {
                    this.toggleModalMove(false);
                    this.reload();
                } else {
                    modalAlert("Při přesouvání média do jiné kategorie došlo k chybě.");
                }
            }
        );
    };

    createRecord() {
        let nameOfNewRecord = document.getElementById("newRecordName").value;
        if (this.state.showCategory) {
            put("/record/" + encodeURIComponent(nameOfNewRecord) + "/" + encodeURIComponent(this.state.showCategory)).then(
                response => {
                    if (response) {
                        this.toggleModalAdd(false);
                        PubSub.publish('addedRecord');
                        this.reload();
                    } else {
                        this.toggleModalAdd(false);
                        modalAlert("Médium s tímto názvem již existuje.");
                    }
               }
            );
        }
    }

    render() {
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

                    {this.state.showSearch && this.state.showSearch.searchType && this.state.showSearch.searchText ?
                        <h2>
                            Výsledky pro hledání {this.state.showSearch.searchType === 'categories' ? "kategorie" : "atributu"}: {this.state.showSearch.searchText}
                        </h2>
                        :""}

                    {this.state.showSearch && (!this.state.output || this.state.output.length === 0) ? <h3 className={"main__content__info-title"}>Žádné výsledky</h3> : "" }

                    {this.state.showCategory || this.state.showSearch ?
                        <div>
                        {this.state.output && this.state.output.length > 0 ?
                            <div>
                            {this.state.output.map((table, index) => {
                                return (
                                    <div className={"margin-bottom--15"} key={index}>
                                        <h1>{table[0].name}</h1>
                                        <table className={"main__content__table"}>
                                            <thead>
                                            <tr>
                                                {table[0].attributes && table[0].attributes.map((data, index) => {
                                                    return (
                                                        <th key={index}>{data}</th>
                                                    )}
                                                )}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {table.hasOwnProperty("1") && table[1].records && table[1].records.map((data, index) => {
                                                return (
                                                    <tr
                                                        key={index}
                                                        onClick={(e) => {e.preventDefault(); this.selectRecord(data.id, table[0].name);}}
                                                        className={(this.state.selectedRecord && this.state.selectedRecord.selectedRecord === data.id ? "active" : "")}
                                                    >
                                                        {data.data.map((attributes, index) => {
                                                            return (
                                                                <td key={index}>{attributes}</td>
                                                            )}
                                                        )}
                                                    </tr>
                                                )}
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            )}
                            </div>
                        : ""}
                        </div>
                    :""}
                </div>

                <div className="modal-add">
                    <Rodal
                        visible={this.state.modalAdd}
                        onClose={() => this.toggleModalAdd(false)}
                        animation="slideUp"
                        closeOnEsc={true}
                    >
                        <h1>
                            Přidat médium:
                        </h1>

                        <input className={"margin-top--15"} type={"text"} placeholder={"Název média"} id={"newRecordName"} />

                        <div className={'rodal__confirm__buttons'}>
                            <span className={'rodal__confirm__btn'} onClick={() => this.createRecord()}>Ok</span>
                            <span className={'rodal__confirm__btn rodal__confirm__btn--gray'} onClick={() => this.toggleModalAdd(false)}>Zrušit</span>
                        </div>

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

                        <select className={"margin-top--15"} id={"changeRecordCategorySelect"}>
                            {this.state.modalMoveCategories && this.state.modalMoveCategories.map((data) => {
                                return (
                                    <option value={data.name}>{data.name}</option>
                                )}
                            )}
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