const Context = require.main.require("lib/context.js");
const Sealious = require("sealious");
const field_type_file = require.main.require("lib/base-chips/field-types/file.js");
const acceptCorrectly = require.main.require("tests/util/accept-correctly.js");
const rejectCorrectly = require.main.require("tests/util/reject-correctly.js");

const assert = require("assert");

describe("FieldType.File", function(){
	it("returns undefined", function(){
		assert.strictEqual(field_type_file.is_proper_value({}, {}, new Context(), {}, undefined), undefined);
	});;
	it("accepts given value (which is an instance of Sealious.File)", function(done){
		const {accept, reject} = acceptCorrectly(done);
		field_type_file.is_proper_value(accept, reject, new Context(), {}, new Sealious.File());
	});;
	it("accepts given value (which is an object with filename and data attributes)", function(done){
		const value = {
			filename: "test_filename",
			data: new Buffer(1)
		};
		const {accept, reject} = acceptCorrectly(done);
		field_type_file.is_proper_value(accept, reject, new Context(), {}, value);
	});
	it("rejects given value (which is an empty object)", function(done){
		const {accept, reject} = rejectCorrectly(done);
		field_type_file.is_proper_value(accept, reject, new Context(), {}, {});
	});
	it("rejects given value (which is an array)", function(done){
		const {accept, reject} = rejectCorrectly(done);
		field_type_file.is_proper_value(accept, reject, new Context(), {}, [])
	});
	it("checks if encode works correctly (value_in_code is false)", function(){
		assert.strictEqual(field_type_file.encode(new Context(), {}, false), null);
	});
	it("checks if decode works correctly (value_in_database is false, params.no_file_value is not given)", function(){
		assert.strictEqual(field_type_file.decode(new Context(), {}, false), undefined);
	});
	it("checks if decode works correctly (value_in_database is false, params.no_file_value is given)", function(){
		assert.strictEqual(field_type_file.decode(new Context(), {no_file_value: "test"}, false), "test");
	});
});