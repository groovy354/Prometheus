const Message = require("./../message.js");
const path = require("path");
const mjml2html = require("mjml");
const assert = require("assert");
const turndownService = new require("turndown")();

module.exports = async function SimpleTemplate(app, data) {
	assert(data.text);
	assert(data.subject);
	assert(data.to);
	assert(data.buttons === undefined || Array.isArray(data.buttons));
	if (data.buttons === undefined) {
		data.buttons = [];
	}
	const logo_cid = Math.floor(Math.random() * 10e6).toString();
	return new Message({
		to: data.to,
		subject: data.subject,
		attachments: [
			{
				filename: path.basename(app.manifest.logo),
				path: app.manifest.logo,
				cid: logo_cid,
			},
		],
		text: turndownService.turndown(data.text),
		html: get_html(app, data, logo_cid),
	});
};

function get_html(app, data, logo_cid) {
	const result = mjml2html(`
		<mjml>
		  <mj-body>
			<mj-section>
			  <mj-column>
				<mj-image width="100" src="cid:${logo_cid}"></mj-image>
				<mj-divider border-color="${(app.manifest.colors &&
					app.manifest.colors.primary) ||
					"black"}"></mj-divider>
				<mj-text>
				  <h1>
					 ${data.subject}
				  </h1>
				  ${data.text}
				</mj-text>
				${data.buttons.map(
					button =>
						`<mj-button href="${
							button.href
						}" font-size="20px" background-color="#0074D9">${
							button.text
						}</mj-button>`
				)}
			  </mj-column>
			</mj-section>
		  </mj-body>
		</mjml>
    `);
	return result.html;
}