import assert from "assert";
import { withRunningApp } from "../../../test_utils/with-test-app";
import { assertThrowsAsync } from "../../../test_utils/assert-throws-async";
import { App, Collection, FieldTypes, Policies } from "../../../main";
import { TestAppType } from "../../../test_utils/test-app";

const URL = "/api/v1/collections/boolseals";

function extend(t: TestAppType) {
	const boolseals = new (class extends Collection {
		name = "boolseals";
		fields = {
			is_old: FieldTypes.Required(new FieldTypes.Boolean()),
		};
		defaultPolicy = new Policies.Public();
	})();
	return class extends t {
		collections = {
			...App.BaseCollections,
			boolseals,
		};
	};
}

describe("boolean", () => {
	it("Allows to insert values considered correct", async () =>
		withRunningApp(extend, async ({ rest_api }) => {
			const cases = [
				[true, true],
				[false, false],
				["true", true],
				["false", false],
				["1", true],
				["0", false],
				[1, true],
				[0, false],
			];

			for (const [field_value, saved_value] of cases) {
				const { is_old } = await rest_api.post(URL, {
					is_old: field_value,
				});
				assert.equal(
					is_old,
					saved_value,
					`While entering ${field_value}, the stored value should be ${saved_value}, but was ${is_old}`
				);
			}
		}));

	it("Doesn't let undefined in", () =>
		withRunningApp(extend, async ({ rest_api }) => {
			await assertThrowsAsync(
				() => rest_api.post(`${URL}`, { is_old: undefined }),
				(error) =>
					assert.deepEqual(
						error.response.data.data.is_old.message,
						"Missing value for field 'is_old'."
					)
			);
		}));

	it("Doesn't let '' in", () =>
		withRunningApp(extend, async ({ app, rest_api }) => {
			await assertThrowsAsync(
				() => rest_api.post(`${URL}`, { is_old: "" }),
				(error) => {
					assert.equal(error.response.status, 403);
					assert.deepEqual(
						error.response.data.data.is_old.message,
						app.i18n("invalid_boolean", [undefined])
					);
				}
			);
		}));

	it("Doesn't let unwelcomed values in", () =>
		withRunningApp(extend, async ({ app, rest_api }) => {
			const cases = [
				[null, "Missing value for field 'is_old'."],
				[{}, app.i18n("invalid_boolean", [{}])],
				[[], app.i18n("invalid_boolean", [[]])],
				[[false], app.i18n("invalid_boolean", [[false]])],
				[{ a: true }, app.i18n("invalid_boolean", [{ a: true }])],
			];

			await Promise.all(
				cases.map(([value, error_message]) =>
					assertThrowsAsync(
						() => rest_api.post(`${URL}`, { is_old: value }),
						(error) => {
							assert.equal(error.response.status, 403);
							assert.deepEqual(
								error.response.data.data.is_old.message,
								error_message
							);
						}
					)
				)
			);
		}));

	it("lets filter by literal false value", () =>
		withRunningApp(extend, async ({ app }) => {
			await app.collections.boolseals.create(new app.SuperContext(), {
				is_old: true,
			});
			await app.collections.boolseals.create(new app.SuperContext(), {
				is_old: false,
			});
			const { items: seals } = await app.collections.boolseals
				.list(new app.SuperContext())
				.filter({ is_old: false })
				.fetch();
			assert.strictEqual(seals.length, 1);
		}));
});
