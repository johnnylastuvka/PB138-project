import React, {Component} from 'react';
import {get} from "../../utils/Api";
import * as PubSub from "pubsub-js";


export default class SideBar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            categories: null,
            selectedCategory: null,
        };
    }

    componentDidMount() {
        this.reload();
    }

    componentWillMount = function () {
        this._selectCategory = PubSub.subscribe('selectCategory', this.remoteSelectCategory.bind(this));
    };

    componentWillUnmount = function () {
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
        get("/document").then(response => {
            if (response) {
                console.log(response);
            }
        });
        //
        // let cats = [
        //     {id: 1, name: "xxx"},
        //     {id: 2, name: "yyy"},
        //     {id: 3, name: "Dokumenty_-_časopisy-a-ještě-něco"}
        // ];
        // this.setState({categories: cats});
    };

    selectCategory(selectedCategory) {
        this.setState({selectedCategory});
        PubSub.publish('selectedCategory', {selectedCategory: selectedCategory});
    }

    render() {
        return (
            <div className={"sidebar"}>
                <div>
                    <h2 className={"d-inline-block"}>Kategorie</h2>
                    <button className={"button-circle button-circle--small margin-left--40"}><i className={"fa fa-plus"}></i></button>
                </div>

                <div>
                        {this.state.categories ?
                            <ul className={"categories-list"}>
                                {this.state.categories.map((category) => {
                                    return (
                                        <li key={category.id} className={(this.state.selectedCategory === category.id ? "active" : "")}>
                                            <span
                                                className={"categories-list__item__name"}
                                                onClick={(e) => { e.preventDefault(); this.selectCategory(category.id); }}
                                            >
                                                {category.name}
                                            </span>
                                            {this.state.selectedCategory === category.id ?
                                                <button className={"button-circle button-circle--small"}><i className={"fa fa-minus"}></i></button>
                                                : ""}
                                        </li>
                                    )}
                                )}
                            </ul>

                            : <span className={"text--darken text--small"}>Nejsou vytvořeny žádné kategorie</span>}
                </div>
            </div>
        )
    }
}