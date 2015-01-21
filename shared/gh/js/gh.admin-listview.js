/*!
 * Copyright 2014 Digital Services, University of Cambridge Licensed
 * under the Educational Community License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['gh.core', 'gh.new-module'], function(gh) {

    /**
     * Set up the modules of events in the sidebar. Note that the generic gh.listview.js does
     * all the heavy lifting and this function handles admin-specific functionality
     *
     * @param  {Event}     ev      Standard jQuery event
     * @param  {Object}    data    Data object describing the selected part to fetch modules for
     * @private
     */
    var setUpModules = function(ev, data) {
        // Hide the tripos help text
        $('.gh-tripos-help').hide();
    };

    var selectSeries = function() {
        // Remove the active state from other series
        $('.gh-series-select').removeClass('gh-series-active');
        // Add the active state to the clicked series
        $(this).addClass('gh-series-active');
        // TODO: Load the series in batch edit mode
    };

    /////////////
    // BINDING //
    /////////////

    /**
     * Add handlers to various elements in the listview
     */
    var addBinding = function() {
        // Select a series in the sidebar
        $('body').on('click', '.gh-series-select', selectSeries);
        // Set up the modules in the sidebar
        $(document).on('gh.listview.setup', setUpModules);
    };

    addBinding();

});
