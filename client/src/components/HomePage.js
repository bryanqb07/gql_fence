import React from "react";
import ProductsIndex from "./products/ProductsIndex";
import Slideshow from "./Slideshow";

const HomePage = (props) => (
    <div className="homepage-wrapper">
        <Slideshow />
        <ProductsIndex match={props.match} />
    </div>
)

export default HomePage;