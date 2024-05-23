const { algoliasearch, instantsearch } = window;

const searchClient = algoliasearch(
  'RUYDS1M9XL',
  '0a4f95eb04d1fc4422373aa864bb2ff4'
);

const search = instantsearch({
  indexName: 'algoflix_en',
  searchClient,
  //insights: true,
  // routing: true, // Basic routing enabled.
  /* routing: {
    // Basic routing with index set, so it doesn't show in the URL.
    stateMapping: instantsearch.stateMappings.singleIndex('algoflix-en-us'),
  }, */
  /* routing: {
    // Custom routes.
    router: instantsearch.routers.history({
      windowTitle({ query }) {
        return query ? `Results for "${query}"` : 'Search';
      },

      createURL({ qsModule, routeState, location }) {
        const urlParts = location.href.match(/^(.*?)/);
        const baseUrl = `${urlParts ? urlParts[1] : ''}/`;
        //console.log('cU:', routeState, urlParts, baseUrl);

        const queryParameters = {};
        if (routeState.query) {
          queryParameters.query = encodeURIComponent(routeState.query);
        }
        if (routeState.page !== 1) {
          queryParameters.page = routeState.page;
        }
        if (routeState.year) {
          queryParameters.year = routeState.year.map(encodeURIComponent);
        }
        if (routeState.genres) {
          queryParameters.genres = routeState.genres.map(encodeURIComponent);
        }
        if (routeState.price) {
          queryParameters.price = routeState.price.map(encodeURIComponent);
        }
        if (routeState.priceRange) {
          queryParameters.priceRange = routeState.priceRange;
        }

        const queryString = qsModule.stringify(queryParameters, {
          addQueryPrefix: true,
          arrayFormat: 'repeat',
        });

        return `${baseUrl}${queryString}`;
      },

      parseURL({ qsModule, location }) {
        //console.log('pU:', location);
        const {
          query = '',
          page,
          year = [],
          genres = [],
          price = [],
          priceRange = '',
        } = qsModule.parse(location.search.slice(1));
        //console.log('search', location.search.slice(1));
        // `qs` does not return an array when there's a single value.
        const allYears = Array.isArray(year) ? year : [year].filter(Boolean);
        const allGenres = Array.isArray(genres)
          ? genres
          : [genres].filter(Boolean);
        const allPrices = Array.isArray(price)
          ? price
          : [price].filter(Boolean);
        //console.log('data', allYears, allGenres, allPrices, priceRange);

        return {
          query: decodeURIComponent(query),
          page,
          year: allYears.map(decodeURIComponent),
          genres: allGenres.map(decodeURIComponent),
          price: allPrices.map(decodeURIComponent),
          priceRange,
        };
      },
    }),

    stateMapping: {
      stateToRoute(uiState) {
        const indexUiState = uiState['algoflix-en-us'] || {};
        //console.log('sr:', uiState);

        return {
          query: indexUiState.query,
          page: indexUiState.page,
          year: indexUiState.refinementList && indexUiState.refinementList.year,
          genres:
            indexUiState.refinementList && indexUiState.refinementList.genres,
          price:
            indexUiState.refinementList && indexUiState.refinementList.price,
          priceRange: indexUiState.range && indexUiState.range.price,
        };
      },

      routeToState(routeState) {
        //console.log('routeToState:', routeState);
        return {
          algoflix: {
            query: routeState.query,
            page: routeState.page,
            refinementList: {
              year: routeState.year,
              genres: routeState.genres,
              price: routeState.price,
            },
            range: { price: routeState.priceRange },
          },
        };
      },
    },
  }, */
});

search.addWidgets([
  instantsearch.widgets.configure({
    hitsPerPage: 8,
  }),
  instantsearch.widgets.clearRefinements({
    container: '#clear-refinements',
  }),
  instantsearch.widgets.currentRefinements({
    container: '#current-refinements',
  }),
  instantsearch.widgets.refinementList({
    container: '#year',
    attribute: 'year',
    limit: 5,
    showMore: true,
  }),
  instantsearch.widgets.refinementList({
    container: '#price',
    attribute: 'price',
  }),
  /* instantsearch.widgets.rangeSlider({
    container: '#price-slider',
    attribute: 'price',
    pips: false,
    tooltips: {
      format(value) {
        if (value < 3) return 'Low';
        if (value < 7) return 'Mid';
        if (value >= 7) return 'High';
        return value;
      },
    },
  }), */
  instantsearch.widgets.refinementList({
    container: '#genres',
    attribute: 'genres',
  }),
  instantsearch.widgets.searchBox({
    container: '#searchbox',
  }),
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: hit => `
        <div>
          <img src="${hit.poster}" align="left" alt="${hit.title}" />
          <div class="hit-name">
            <span class="hit-title">${instantsearch.highlight({
              attribute: 'title',
              hit,
            })}</span> 
            <span class="hit-year">(${hit.year})</span>
          </div>
          <div class="hit-price">$${hit.price}</div>
        </div>
      `,
    },
  }),
  instantsearch.widgets.pagination({
    container: '#pagination',
  }),
]);

search.start();
