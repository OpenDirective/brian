import {run} from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import App from './components/App';
import {isolate} from '@cycle/isolate';
import {restart, restartable} from 'cycle-restart';

const drivers = {
  DOM: makeDOMDriver('#root')
};

if (module.hot) {   // hot loading enabled in config
  console.log('Hot reloading enabled');

  const drivers2 = {};
  for (var prop in drivers) {
    if( drivers.hasOwnProperty( prop ) ) {
      drivers2[prop] = restartable(drivers[prop], {pauseSinksWhileReplaying: false});
    }
  }
  const {sinks, sources} = run( App, drivers );

  module.hot.accept('./components/App', () => {
  const app = require('./components/App' ).default;
  restart(app, drivers2, {sinks, sources}, isolate);
  });
}
else {
  run(App, drivers);
}

