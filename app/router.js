import React from 'react';
import PropTypes from 'prop-types';
import createHistory from 'history/createBrowserHistory';
import { ConnectedRouter } from 'react-router-redux';
import { Switch, Route } from 'react-router-dom';

import GA from 'react-ga';
import { google } from '../package';

import Layout from './components/Layout';
import Home from './components/Home';
import List from './components/List';
import Table from './components/Table';

export const history = createHistory({ basename: '/' });

const trackView = () => GA.pageview(window.location.pathname + window.location.search);

if(process.env.NODE_ENV === 'production') {
    GA.initialize(google.analyticsTrackingID);
    trackView();
    history.listen((location, action) => trackView());
}

export default class Router extends React.Component {
    render = () => {
        return (
            <ConnectedRouter history={history}>
                <Layout>
                    <Route exact={true} path={'/'} component={Home} />
                    <Route exact={true} path={'/list'} component={List} />
                    <Route exact={true} path={'/table'} component={Table} />
                </Layout>
            </ConnectedRouter>
        );
    }
}
