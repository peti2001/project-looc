import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Page,
  Navbar,
  Block,
  List,
  Link,
  Searchbar,
  Icon,
} from 'framework7-react';
import CompanyCard from '../components/CompanyCard';

import { mockCompany } from '../utils/mocks';
import { search } from '../utils/api';

import './Home.less';

import CrLogo from '../assets/cr-logo.svg';

let searchTimeout;

export default () => {
  const query = useRef('');
  const loading = useRef(false);
  const page = useRef(1);
  const [companies, setCompanies] = useState(null);
  const [hasMoreCompanies, setHasMoreCompanies] = useState(true);

  const setQuery = (value) => {
    query.current = value;
  };

  const setLoading = (value) => {
    loading.current = value;
  };

  const setPage = (value) => {
    page.current = value;
  };

  const addCompanies = (companiesToAdd = []) => {
    setCompanies([...(companies || []), ...companiesToAdd]);
  };

  const load = (newPage) => {
    if (loading.current) return;
    if (!newPage) {
      setCompanies(null);
      setPage(1);
    } else {
      setPage(newPage);
    }
    setLoading(true);
    search({ query: query.current, page: newPage || page.current, perPage: 50 })
      .then((data) => {
        const companiesResult = data.companies || [];
        if (!newPage) {
          setCompanies(companiesResult);
        } else {
          addCompanies(companiesResult);
        }

        if (companiesResult.length < 50) {
          setHasMoreCompanies(false);
        } else {
          setHasMoreCompanies(true);
        }

        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const onInfinite = () => {
    load(page.current + 1);
  };

  const onSearch = (newQuery) => {
    setQuery(newQuery);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      load();
    }, 500);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Page
      name="home"
      className="search-page"
      infinite
      infinitePreloader={hasMoreCompanies}
      onInfinite={onInfinite}
    >
      <Navbar transparent title="Leaderboard of open-source companies">
        <Link href="/about/" slot="right">
          About
        </Link>
      </Navbar>

      <div className="center-content">
        <Block className="page-header">
          <Icon
            f7="chevron_left_slash_chevron_right"
            color="primary"
            size={68}
          />
          <h1 className="page-title">Leaderboard of Open Source Companies</h1>
          <h2 className="page-header-subtitle">
            Scored by
            <a
              href="https://codersrank.io"
              target="_blank"
              rel="noreferrer noopener"
            >
              <img alt="CodersRank" src={CrLogo} />
            </a>
          </h2>
        </Block>
        <Searchbar
          className="main-searchbar"
          placeholder="Search company"
          customSearch
          onSearchbarSearch={(sb, query) => onSearch(query)}
        />

        {companies && companies.length === 0 ? (
          <Block strong inset>
            <p className="text-align-center">
              <b>No companies found</b>
            </p>
          </Block>
        ) : (
          <List
            mediaList
            noHairlines
            noHairlinesBetween
            className="company-list"
          >
            <ul>
              {companies === null &&
                Array.from({ length: 50 }).map((_, index) => (
                  <CompanyCard
                    key={index}
                    company={{ ...mockCompany }}
                    skeleton
                  />
                ))}
              {companies &&
                companies.length > 0 &&
                companies.map((company, index) => (
                  <CompanyCard
                    key={index}
                    company={company}
                    skeleton={company.skeleton}
                  />
                ))}
            </ul>
          </List>
        )}
      </div>
    </Page>
  );
};
