import {
	App,
	Collection,
	FieldTypes,
	AccessStrategies,
	FieldDefinitionHelper as field,
} from "../../main";

export default (app: App) => {
	return Collection.fromDefinition(app, {
		name: "anonymous-sessions",
		fields: [
			field("anonymous-session-id", FieldTypes.SessionID, {}, true),
			field("anonymous-user-id", FieldTypes.ShortID, {}, true),
		],
		access_strategy: {
			default: AccessStrategies.Super,
		},
	});
};
