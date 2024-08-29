import React, { useState } from "react";
import FacebookLogin from "react-facebook-login";

export const FacebookLoginButton = () => {
  const [profile, setProfile] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [selectedPageAccessToken, setSelectedPageAccessToken] = useState("");
  const [insights, setInsights] = useState([]);
  const [dateRange, setDateRange] = useState({
    since: "2024-08-08",
    until: "2024-08-08",
  });

  const responseFacebook = (response) => {
    console.log(response);
    setProfile({
      name: response.name,
      picture: response.picture.data.url,
      accessToken: response.accessToken,
    });
    fetchManagedPages(response.accessToken);
  };

  const fetchManagedPages = (accessToken) => {
    window.FB.api(
      "/me/accounts",
      { access_token: accessToken },
      function (response) {
        if (response && !response.error) {
          setPages(response.data);
        } else {
          console.error("Error fetching pages:", response.error);
        }
      }
    );
  };

  const fetchPageInsights = (pageId, pageAccessToken) => {
    window.FB.api(
      `/${pageId}/insights`,
      {
        access_token: pageAccessToken,
        metric:
          "page_posts_impressions,post_reactions_like_total,page_follows,page_post_engagements",
        since: dateRange.since,
        until: dateRange.until,
        period: "total_over_range",
      },
      function (response) {
        console.log("Insights Response:", response);
        if (response && !response.error) {
          if (response.data.length === 0) {
            console.warn(
              "No insights data available for the selected page and date range."
            );
          }
          setInsights(response.data);
        } else {
          console.error("Error fetching insights:", response.error);
        }
      }
    );
  };

  const handlePageSelection = (event) => {
    const selectedPage = pages.find((page) => page.id === event.target.value);
    setSelectedPageId(event.target.value);
    setSelectedPageAccessToken(selectedPage.access_token);
  };

  const handleSubmit = () => {
    if (selectedPageId && selectedPageAccessToken) {
      fetchPageInsights(selectedPageId, selectedPageAccessToken);
    } else {
      console.warn("No page selected or access token missing.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Facebook API Integration</h1>
      {!profile ? (
        <FacebookLogin
          appId="857117662704495"
          autoLoad={true}
          fields="name,picture"
          scope="pages_show_list,pages_read_engagement"
          callback={responseFacebook}
        />
      ) : (
        <div>
          <h2>{profile.name}</h2>
          <img src={profile.picture} alt="Profile" />
          {pages.length > 0 && (
            <div>
              <h3>Select a Page:</h3>
              <select onChange={handlePageSelection} value={selectedPageId}>
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name} (ID: {page.id})
                  </option>
                ))}
              </select>
              <div>
                <label>
                  From:
                  <input
                    type="date"
                    name="since"
                    value={dateRange.since}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, since: e.target.value })
                    }
                  />
                </label>
                <label>
                  To:
                  <input
                    type="date"
                    name="until"
                    value={dateRange.until}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, until: e.target.value })
                    }
                  />
                </label>
              </div>
              <button onClick={handleSubmit}>Submit</button>
            </div>
          )}
          {insights.length > 0 ? (
            <div style={{ marginTop: "20px" }}>
              <h3>Page Insights:</h3>
              {insights.map((insight) => (
                <div
                  key={insight.name}
                  style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    margin: "10px",
                    textAlign: "left",
                  }}
                >
                  <h4>{insight.name.replace("page_", "").replace("_", " ")}</h4>
                  {insight.values.map((value) => (
                    <p key={value.end_time}>
                      {value.name.replace("page_", "").replace("_", " ")}:{" "}
                      {value.value}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: "20px" }}>
              <h3>Page Insights:</h3>
              <p>No insights data available.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
