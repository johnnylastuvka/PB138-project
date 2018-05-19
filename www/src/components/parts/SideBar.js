import React, {Component} from 'react';
import {get, httpDelete, put} from "../../utils/Api";
import * as PubSub from "pubsub-js";
import Rodal from "rodal";
import modalAlert from "../utils/alert";
import confirm from "../utils/confirm";

export default class SideBar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            categories: null,
            selectedCategory: null,
            openModal: false,
        };
    }

    componentDidMount() {
        this.reload();
    }

    componentWillMount = () => {
        this._selectCategory = PubSub.subscribe('selectCategory', this.remoteSelectCategory.bind(this));
    };

    componentWillUnmount = () => {
        PubSub.unsubscribe(this._selectCategory);
    };

    remoteSelectCategory = (msg, data) => {
        this.selectCategory(data.categoryId);
    };

    reload = () => {
        /*
            We must download all data because API doesn't have methods like
            GET /api/category/all
            GET /api/record/all
            GET /api/record/$id
            GET /api/record/byCategory/$id etc.
         */
        get("/document/").then(response => {
            if (response && response.data) {

                let parseString = require('xml2js').parseString;
                let categories = [];

                parseString(response.data, (err, result) => {
                    if (result && result.library && result.library.category) {
                        for (let row in result.library.category) {
                            let category = result.library.category[row];
                            categories.push({name: category.$.name});
                        }
                    }
                });

                this.setState({categories});

            }
        });

    };

    selectCategory(selectedCategory) {
        this.setState({selectedCategory});
        PubSub.publish('selectedCategory', {selectedCategory: selectedCategory});
    }

    toggleModal = (openModal) => {
        document.getElementById("addCategoryInput").value = '';

        this.setState({openModal});

        if (openModal) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
    };

    createCategory() {
        let nameOfNewCategory = document.getElementById("addCategoryInput").value;

        put("/category/" + encodeURIComponent(nameOfNewCategory)).then(
            response => {
                if (response) {
                    this.reload();
                    this.toggleModal(false);
                    PubSub.publish('addedCategory');
                } else {
                    this.toggleModal(false);
                    modalAlert("Kategorii s tímto názvem již existuje!");
                }
            }
        );
    }

    removeCategory(categoryId) {

        confirm("Opravdu chcete smazat kategorii " + categoryId + "?").then(
            result => {
                httpDelete("/category/" + encodeURIComponent(categoryId)).then(
                    response => {
                        if (response) {
                            this.reload();
                            PubSub.publish('removedCategory', {categoryId: categoryId});
                            this.setState({selectedCategory: null});
                        } else {
                            modalAlert("Nelze smazat neprázdnou kategorii!");
                        }
                    }
                );
            },
            result => {
                // `cancel` callback
            }
        );
    }

    render() {
        return (
            <div className={"sidebar"}>
                <div>
                    <h2 className={"d-inline-block"}>Kategorie</h2>
                    <button
                        className={"button-circle button-circle--small margin-left--40"}
                        onClick={(e) => {e.preventDefault(); this.toggleModal(true);}}
                    >
                        <i className={"fa fa-plus"}></i>
                    </button>
                </div>

                <div>
                        {this.state.categories && this.state.categories.length > 0 ?
                            <ul className={"categories-list"}>
                                {this.state.categories.map((category, index) => {
                                    return (
                                        <li key={index} className={(this.state.selectedCategory === category.name ? "active" : "")}>
                                            <span
                                                className={"categories-list__item__name"}
                                                onClick={(e) => { e.preventDefault(); this.selectCategory(category.name); }}
                                            >
                                                {category.name}
                                            </span>
                                            {this.state.selectedCategory === category.name ?
                                                <button
                                                    onClick={(e) => {e.preventDefault(); this.removeCategory(category.name);}}
                                                    className={"button-circle button-circle--small"}
                                                >
                                                    <i className={"fa fa-minus"}></i>
                                                </button>
                                                : ""}
                                        </li>
                                    )}
                                )}
                            </ul>

                            : <span className={"text--darken text--small"}>Nejsou vytvořeny žádné kategorie</span>}
                </div>

                <div className="modal-add-category">
                    <Rodal
                        visible={this.state.openModal}
                        onClose={() => this.toggleModal(false)}
                        animation="slideUp"
                        closeOnEsc={true}
                    >
                        <h1>
                            Přidat kategorii:
                        </h1>

                        <input className={"margin-top--15"} type={"text"} placeholder={"Název kategorie"} id={"addCategoryInput"} />

                        <div className={'rodal__confirm__buttons'}>
                            <span className={'rodal__confirm__btn'} onClick={() => this.createCategory()}>Ok</span>
                            <span className={'rodal__confirm__btn rodal__confirm__btn--gray'} onClick={() => this.toggleModal(false)}>Zrušit</span>
                        </div>
                    </Rodal>
                </div>
            </div>
        )
    }
}