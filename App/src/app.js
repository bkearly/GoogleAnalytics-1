import React from 'react'
import ReactDOM from 'react-dom'
import { setFreshAccessToken, getAccessTokenAjaxCall, login, gup, validateToken, displayFieldset } from './utils/utils'
import AyxStore from './stores/AyxStore'
import * as accounts from './utils/accountUtils'
import * as metadataRequest from './utils/metadataRequest'
import { toJS, extendObservable, autorun } from 'mobx'
import * as goals from './utils/goals'
import * as segments from './utils/segments'
import MetricMessage from './components/metricMessage.jsx'
import DimensionMessage from './components/dimensionMessage.jsx'
import SegmentMessage from './components/SegmentMessage'

Alteryx.Gui.AfterLoad = (manager) => {

  // Adds metrics.metricsSelectionCheck to UserDataChanged of metricsList
  // bind functions no longer necessary due to metricMessage.js and dimensionMessage.js
  // metrics.bindMetricCheck()
  // dimensions.bindDimensionCheck()

  const collection = [
    {key: 'client_id', type: 'value'},
    {key: 'client_secret', type: 'value'},
    {key: 'refresh_token', type: 'value'},
    {key: 'accessToken', type: 'value'},
    {key: 'metricsList', type: 'listBox'},
    {key: 'metricsGoalsList', type: 'listBox'},
    {key: 'dimensionsGoalsList', type: 'listBox'},
    {key: 'accountsList', type: 'dropDown'},
    {key: 'webPropertiesList', type: 'dropDown'},
    {key: 'profilesList', type: 'dropDown'},
    {key: 'dimensionsList', type: 'listBox'},
    {key: 'segmentsList', type: 'listBox'}
  ]

  // Instantiate the mobx store which will sync all dataItems
  // specified in the collection.
  const store = new AyxStore(manager, collection)

 // Add computed value to store that tracks total selections for metrics and metric goals.
  extendObservable(store, {
    totalMetricsAndGoals: () => {
      let total = store.metricsList.selection.length + store.metricsGoalsList.selection.length
      return total;
    }
  })
  // Add computed value to store that tracks total selections for dimensions and dimension goals.
  extendObservable(store, {
    totalDimensionsAndGoals: () => {
      let total = store.dimensionsList.selection.length + store.dimensionsGoalsList.selection.length
      return total;
    }
  })
  // Using an autorun function to watch store.webPropertiesList.selection.  If
  // it changes, trigger the accounts.populateProfilesMenu function.
  autorun(() => {
    if (store.webPropertiesList.selection !== '' && store.webPropertiesList.stringList.length > 0) {
      accounts.populateProfilesMenu(store)
    }
  })
  autorun(() => {
    if (store.accessToken !== '' || store.accountsList.stringList.length < 1) {
      accounts.populateAccountsList(store)
      metadataRequest.pushCombinedMetadata(store)
      goals.populateMetricsGoalsList(store)
      goals.populateDimensionsGoalsList(store)
    }
  })

  autorun(() => {
    if (store.accountsList.selection !== '') {
      accounts.populateWebPropertiesList(store);
    }
  })
  // Render react component which handles Metric selection messaging.
  extendObservable(store,{
    totalSegments: () => {
      let total = store.segmentsList.selection.length 
      return total;
    }
  })

  //Render react component which handles Metric selection messaging.
  ReactDOM.render(<MetricMessage store={store} />, document.querySelector('#selectedMetrics'));
  // Render react component which handles Dimension selection messaging.
  ReactDOM.render(<DimensionMessage store={store} />, document.querySelector('#selectedDimensions'));
  ReactDOM.render(<SegmentMessage store={store} />, document.querySelector('#selectedSegments'));

  let optionList = [{uiobject: 'test1', dataname: 'test1 value'},
                    {uiobject: 'test2', dataname: 'test2 value'}]

  // create promise that will run combinedMetricsMetadata and show metrics fieldset

  // metadataRequest.pushCombinedMetadata(store)
  // goals.populateMetricsGoalsList(store)
  // goals.populateDimensionsGoalsList(store)
  segments.populateSegmentsList(store)

  window.optionList = optionList

  window.store = store

  window.setFreshAccessToken = setFreshAccessToken

  window.login = login

  window.displayFieldset = displayFieldset

  window.populateAccountsList = accounts.populateAccountsList

  window.populateWebPropertiesList = accounts.populateWebPropertiesList

  window.populateProfilesMenu = accounts.populateProfilesMenu

  window.populateMetricsGoalsList = goals.populateMetricsGoalsList

  window.populateDimensionsGoalsList = goals.populateDimensionsGoalsList

  accounts.populateAccountsList(store)

  // accounts.populateWebPropertiesList(store)
  // accounts.populateProfilesMenu(store)
}
