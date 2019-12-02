import React from 'react';
import { FETCH_ORDER } from '../graphql/queries';
import { Query } from "react-apollo";

const ConfirmationPage = (props) => {
    const orderId = { id: props.history.location.search.split("=")[1] };
    return (
        <Query query={FETCH_ORDER} variables={orderId}>
            {({ loading, error, data }) => {
                if (loading) return <div className="loader">Loading...</div>
                if (error) return `Error! ${error.message}`;

                const order = data.order;
                console.log(order);
                return (
                    <div>
                        <div>
                            <h3>Confirmation Page</h3>
                            <p>Congratulations on your successful order!</p>
                            <p>A confirmation email and receipt have been sent to test@mail.com</p>
                            <p>Confirmation #: {data.order.id}</p>
                            <p>Order Total: ${data.order.total}</p>
                        </div>
                    </div>
                )
            }}
        </Query>
    );
};

export default ConfirmationPage;