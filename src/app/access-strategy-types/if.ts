import {
	AccessStrategies,
	App,
	AccessStrategy,
	SpecialFilter,
	Context,
	Queries,
	SingleItemResponse,
} from "../../main";
import { AccessStrategyDefinition } from "../../chip-types/access-strategy";

export default class If extends AccessStrategy {
	static type_name = "if";
	collection_name: string;
	filter_name: string;
	strategy_when: { [key in "true" | "false"]: AccessStrategy };
	constructor([
		collection_name,
		special_filter_name,
		when_true,
		when_false = AccessStrategies.Noone,
	]: [string, string, AccessStrategyDefinition, AccessStrategyDefinition?]) {
		super([collection_name, special_filter_name, when_true, when_false]);
		this.filter_name = special_filter_name;
		this.collection_name = collection_name;
		this.strategy_when = {
			true: AccessStrategy.fromDefinition(when_true),
			false: AccessStrategy.fromDefinition(when_false),
		};
	}

	getFilter(app: App): SpecialFilter {
		return app.collections[this.collection_name].getNamedFilter(
			this.filter_name
		);
	}

	async constructQuery(context: Context) {
		const filtering_query = await this.getFilter(
			context.app
		).getFilteringQuery();
		return new Queries.Or(
			new Queries.And(
				filtering_query,
				await this.strategy_when.true.getRestrictingQuery(context)
			),
			new Queries.And(
				new Queries.Not(filtering_query),
				await this.strategy_when.false.getRestrictingQuery(context)
			)
		);
	}

	async _getRestrictingQuery(context: Context) {
		return this.constructQuery(context);
	}
	async checkerFunction(
		context: Context,
		sealious_response: SingleItemResponse
	) {
		const query = await this.constructQuery(context);
		query.match({ sealious_id: sealious_response.id });
		const results = await context.app.Datastore.aggregate(
			sealious_response._metadata.collection_name,
			query.toPipeline()
		);
		if (!results.length) {
			return AccessStrategy.deny(
				this.getFilter(context.app).getNopassReason()
			);
		}
		return AccessStrategy.allow(
			`the item passes the "${this.filter_name}" filter`
		);
	}
	isItemSensitive = async () => true;
}
