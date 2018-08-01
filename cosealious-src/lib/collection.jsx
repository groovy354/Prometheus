const React = require("react");
const CachedHttp = require("./cached-http.js");

function Collection(
	{
		collection,
		query_store,
		get_forced_filter = () => {},
		get_forced_format = () => {},
		get_forced_sort = () => {},
	},
	component
) {
	return class Component extends React.Component {
		constructor() {
			super();
			this.state = {
				loading: true,
				resources: [],
			};
		}
		componentDidMount() {
			this.refreshComponent();
			query_store.on("change", () => this.refreshComponent());
		}
		componentDidUpdate(prevProps, prevState) {
			const serialized_last_filter = JSON.stringify(
				get_forced_filter(prevProps)
			);
			const serialized_current_filter = JSON.stringify(
				get_forced_filter(this.props)
			);
			if (serialized_last_filter !== serialized_current_filter) {
				this.refreshComponent();
			}
		}
		refreshComponent(options) {
			const default_options = {
				force: false,
				show_loading: true,
			};
			const { force, show_loading } = Object.assign(
				{},
				default_options,
				options
			);
			if (force) CachedHttp.flush();
			if (show_loading) this.setState({ loading: true });
			CachedHttp.get(`/api/v1/collections/${collection}`, {
				filter: Object.assign(
					{},
					query_store.getQuery().filter,
					get_forced_filter(this.props)
				),
				format: get_forced_format(this.props),
				sort: Object.assign(
					{},
					query_store.getQuery().sort,
					get_forced_sort(this.props)
				),
			}).then(resources => {
				this.setState({ resources, loading: false });
			});
		}
		render() {
			return React.createElement(component, {
				collection,
				query_store,
				resources: this.state.resources,
				loading: this.state.loading,
				metadata: this.props.metadata,
				refresh: this.refreshComponent.bind(this),
			});
		}
	};
}

module.exports = Collection;