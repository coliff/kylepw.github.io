---
---
/**
 * Fetch and display merged pull request data from Github Search API.
 */
(function (document, window) {
  var keyName = 'kylepwMerged'

  /**
   * Format json data of merged PRs into html.
   * @param  {Object} merged json data of merged PRs
   * @return {String}        html-formatted string of merged PR info
   */
  function parseData(merged) {
    let output = '';
    // Check that its a non-empty object
    if (merged.constructor === Object && Object.keys(merged).length != 0) {
      // Max number of PRs to display.
      const PR_NUM = Math.min(9, Object.keys(merged.items).length);
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      for (let i = 0; i < PR_NUM; i++) {
        date = new Date(merged.items[i].closed_at);
        date_str = (months[date.getMonth()+1]) + ' ' + date.getDate() + ', ' + date.getFullYear();
        output +=
        '<div class="col-sm-6 col-md-12 col-lg-6 col-xl-4 mb-3">' +
          '<div class="github-component d-flex flex-column flex-justify-between height-full text-left {% if site.style == "dark" %}box-shadow{% else %}border border-gray-light{% endif %} bg-white rounded-1 p-3">' +
            '<div class="d-flex flex-justify-between flex-items-start mb-1">' +
              '<h1 class="f4 lh-condensed mb-1">' +
                '<a href="'+merged.items[i].html_url+'" target="_blank">' +
                  '{% octicon git-merge height:20 class:"mr-1 v-align-middle" fill:"#586069" aria-label:repo %}' +
                  merged.items[i].title +
                '</a>' +
              '</h1>' +
            '</div>' +
            '<div class="text-gray mb-2 ws-normal">' +
              '#'+merged.items[i].number+' by <a href="'+merged.items[i].user.html_url+'" target="_blank">' +
              merged.items[i].user.login+'</a> merged on '+ date_str +
            '</div>' +
          '</div>' +
        '</div>';
      }
    } else {
      console.log('Failed to parse obj: ' + JSON.stringify(merged))
    }
    return output
  }

  /**
   * Fetch merged PR data from Github API and display on DOM.
   */
  function fetchData() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.github.com/search/issues?q=is:pr+author:kylepw+archived:false+is:merged', true);

    xhr.onload = function() {
      let output = '';
      if (this.status == 200) {
        // Store value in session to avoid rate limit restrictions
        sessionStorage.setItem(keyName, this.responseText)
        console.log('Github response stored in session key '+"'"+keyName+"'")
        output = parseData(JSON.parse(this.responseText));
      } else {
        console.log("Failed to fetch Github data: " + this.statusText);
        console.log(this.responseText)
        output = '<a href="https://github.com/pulls?q=is%3Apr+author%3Akylepw+archived%3Afalse+is%3Amerged" target=”_blank”>View</a>'
      }
      document.getElementById('merged').innerHTML = output
    }
    xhr.send();
  }

  window.onload = () => {
    let output = '';
    if (sessionStorage && sessionStorage.getItem(keyName)) {
      // Use value stored in session
      let merged = JSON.parse(sessionStorage.getItem(keyName))
      document.getElementById('merged').innerHTML = parseData(merged);
    } else {
      fetchData();
    }
  }

})(document, window);
