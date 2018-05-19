import React, {Component} from 'react';
import * as PubSub from "pubsub-js";

export default class Header extends Component {

    constructor(props) {
        super(props);
        this.state = {
            searchType: props.searchType ? props.searchType : "categories",
            searchText: props.searchText ? props.searchText : "",
        };
        this.handleChange = this.handleChange.bind(this);
    }

    changeSearchType(searchType) {
        if (searchType === "categories" || searchType === "attributes") {
            this.setState({searchType});
        }
    }

    search() {
        PubSub.publish('selectCategory', {categoryId: null});
        PubSub.publish('search', {searchType: this.state.searchType, searchText: this.state.searchText});
    }

    handleChange(event) {
        this.setState({searchText: event.target.value});
    }

    resetMainContent() {
        PubSub.publish('selectCategory', {categoryId: null});
        PubSub.publish('search', null);
    }

    render() {
        return (
            <header className={"row header"}>
                <div className={"col-lg-3 header__title pointer"} onClick={(e) => {
                    e.preventDefault();
                    this.resetMainContent();
                }}>
                    <img src={"/img/logo.png"} alt={""}/>
                    <h1>Videotéka</h1>
                </div>

                <div className={"col-lg-5 header__search-input"}>
                    <input type={"text"} placeholder={"Hledat"} defaultValue={this.state.searchText}
                           onChange={this.handleChange} />
                </div>

                <div className={"col-lg-4 header__search-buttons"}>
                    <span className={"header__search-buttons__label"}>Podle:</span>

                    <button
                        className={"header__search-buttons__button " + (this.state.searchType === 'categories' ? "active" : "")}
                        onClick={(e) => {
                            e.preventDefault();
                            this.changeSearchType("categories");
                        }}
                    >
                        Kategorie
                    </button>

                    <button
                        className={"header__search-buttons__button " + (this.state.searchType === 'attributes' ? "active" : "")}
                        onClick={(e) => {
                            e.preventDefault();
                            this.changeSearchType("attributes");
                        }}
                    >
                        Atributů
                    </button>

                    <button
                        className={"header__search-buttons__button margin-left--10"}
                        onClick={(e) => {
                            e.preventDefault();
                            this.search();
                        }}
                    >
                        <i className={"fa fa-search"}></i>
                    </button>
                </div>
            </header>
        )
    }
}