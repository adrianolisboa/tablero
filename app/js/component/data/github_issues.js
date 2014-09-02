/*
 * Copyright 2014 Alexandre Pretto Nunes
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define(['flight/lib/component'],
  function (defineComponent) {
    return defineComponent(githubIssues);

    function githubIssues() {
      this.fetchUserAgentIssues = function () {
        return $.getJSON('https://api.github.com/repos/pixelated-project/pixelated-user-agent/issues?per_page=100');
      };

      this.fetchDispatcherIssues = function () {
        return $.getJSON('https://api.github.com/repos/pixelated-project/pixelated-dispatcher/issues?per_page=100');
      };

      this.fetchPlatformIssues = function () {
        return $.getJSON('https://api.github.com/repos/pixelated-project/pixelated-platform/issues?per_page=100');
      };

      this.fetchIssues = function (ev, data) {
        var userAgentIssuesDeferred, dispatcherIssuesDeferred, platformIssuesDeferred;

        userAgentIssuesDeferred = $.Deferred();
        dispatcherIssuesDeferred = $.Deferred();
        platformIssuesDeferred = $.Deferred();

        this.fetchUserAgentIssues().complete(userAgentIssuesDeferred.resolve);
        this.fetchDispatcherIssues().complete(dispatcherIssuesDeferred.resolve);
        this.fetchPlatformIssues().complete(platformIssuesDeferred.resolve);

        $.when(userAgentIssuesDeferred, dispatcherIssuesDeferred, platformIssuesDeferred).done(
          function (userAgentIssues, dispatcherIssues, platformIssues) {
            var allIssues = [];
            allIssues = allIssues.concat(userAgentIssues[0].responseJSON);
            allIssues = allIssues.concat(dispatcherIssues[0].responseJSON);
            allIssues = allIssues.concat(platformIssues[0].responseJSON);

            this.trigger(document, 'data:issues:refreshed', {issues: allIssues});
          }.bind(this)
        );
      };

      this.assignMyselfToIssue = function (ev, assignData) {
        var user, issue;
        user = assignData.user;
        issue = assignData.issue;

        $.ajax({
          type: 'PATCH',
          url: issue.url,
          data: JSON.stringfy({assignee: user.id}),
          success: function (response, status, xhr) {
            console.log('User ' + user.id + ' assigned to issue ' + issue.title);
          }
        });
      };

      this.after('initialize', function () {
        this.on('ui:needs:issues', this.fetchIssues);
        this.on('ui:assigns:user', this.assignMyselfToIssue);
      });
    }
  }
);
