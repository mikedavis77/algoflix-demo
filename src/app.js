const { algoliasearch, instantsearch } = window;
const { autocomplete } = window['@algolia/autocomplete-js'];
const { createLocalStorageRecentSearchesPlugin } =
  window['@algolia/autocomplete-plugin-recent-searches'];
const { createQuerySuggestionsPlugin } =
  window['@algolia/autocomplete-plugin-query-suggestions'];

const searchClient = algoliasearch(
  'RUYDS1M9XL',
  '0a4f95eb04d1fc4422373aa864bb2ff4'
);

const search = instantsearch({
  indexName: 'algoflix_en',
  searchClient,
  insights: true,
});

const virtualSearchBox = instantsearch.connectors.connectSearchBox(() => {});
search.addWidgets([
  virtualSearchBox({}),
  /* instantsearch.widgets.searchBox({
    container: '#searchbox',
  }), */
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
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: (hit, { html, components, sendEvent }) => html`
        <div>
          <img src="${hit.poster}" align="left" alt="${hit.title}" />
          <div class="hit-name">
            <span class="hit-title"
              >${components.Highlight({
                attribute: 'title',
                hit,
              })}</span
            >
            <span class="hit-year">(${hit.year})</span>
          </div>
          <div class="hit-price">$${hit.price}</div>
          <div class="hit-add-cart">
            <button
              class="add-to-cart"
              onClick="${(event) => {
                event.stopPropagation();
                sendEvent('click', hit, 'Product Added to Cart');
              }}"
            >
              Add to Cart
            </button>
          </div>
        </div>
      `,
    },
  }),
  instantsearch.widgets.pagination({
    container: '#pagination',
  }),
]);

search.start();

/** Autocomplete */
/** Recent searches plugin */
const recentSearchesPlugin = createLocalStorageRecentSearchesPlugin({
  key: 'algoflix_en',
  limit: 3,
  transformSource({ source }) {
    return {
      ...source,
      onSelect({ setIsOpen, setQuery, item, event }) {
        onSelect({ setQuery, setIsOpen, event, query: item.label });
      },
    };
  },
});

/** Query suggestions plugin */
const querySuggestionsPlugin = createQuerySuggestionsPlugin({
  searchClient,
  indexName: 'algoflix_en_query_suggestions',
  getSearchParams() {
    return recentSearchesPlugin.data.getAlgoliaSearchParams({ hitsPerPage: 6 });
  },
  transformSource({ source }) {
    return {
      ...source,
      sourceId: 'querySuggestionsPlugin',
      onSelect({ setIsOpen, setQuery, event, item }) {
        onSelect({ setQuery, setIsOpen, event, query: item.query });
      },
      getItems(params) {
        if (!params.state.query) {
          return [];
        }

        return source.getItems(params);
      },
    };
  },
});

autocomplete({
  container: '#searchbox',
  openOnFocus: true,
  detachedMediaQuery: 'none',
  onSubmit({ state }) {
    setInstantSearchUiState({ query: state.query });
  },
  plugins: [recentSearchesPlugin, querySuggestionsPlugin],
});

function setInstantSearchUiState(indexUiState) {
  search.mainIndex.setIndexUiState({ page: 1, ...indexUiState });
}

function onSelect({ setIsOpen, setQuery, event, query }) {
  if (isModifierEvent(event)) {
    return;
  }

  setQuery(query);
  setIsOpen(false);
  setInstantSearchUiState({ query });
}

function isModifierEvent(event) {
  const isMiddleClick = event.button === 1;

  return (
    isMiddleClick ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  );
}
