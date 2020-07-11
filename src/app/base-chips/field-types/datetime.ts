import { IntStorage } from "./int";
import { Context, Field } from "../../../main";

import { getDateTime } from "../../../utils/get-datetime";

// cannot extends because that changes the output of `decode`. I should use composition here

export default class Datetime extends IntStorage<
	number | string,
	number | string
> {
	getTypeName = () => "datetime";

	async isProperValue(_: Context, value: number | string) {
		const int_result = await super.isProperValue(_, value);
		if (!int_result.valid) {
			return Field.invalid(
				`Value '${value}' is not datetime format. Only timestamps are accepted.`
			);
		}
		return int_result;
	}

	async decode(
		_: Context,
		db_value: number | null,
		__: number,
		format?: "human_readable"
	) {
		if (db_value === null || db_value === undefined) {
			return db_value;
		}
		if (format === undefined) {
			return db_value;
		}
		if (format === "human_readable") {
			const date = new Date(db_value);
			return getDateTime(date);
		}
		return db_value;
	}
}
