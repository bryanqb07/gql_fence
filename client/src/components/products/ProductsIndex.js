import React from "react";
import { FETCH_PRODUCTS } from "../../graphql/queries";
import { Query } from "react-apollo";
import ProductContainer from "./ProductContainer";

const ProductsIndex = ({match}) => (
  <Query query={FETCH_PRODUCTS}>
    {({ loading, error, data }) => {
      if (loading) return <div className="loader"></div>
      if (error) return <div className="error">`Error! ${error.message}`</div>

      return <ProductContainer products={data.products} nonStaff={match.path === "/"} />
    }}
  </Query>
);

export default ProductsIndex;
