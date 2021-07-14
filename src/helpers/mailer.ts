import nodemailer from "nodemailer"
import _ from "lodash"

const recipients = process.env.EVENT_RECIPIENTS

type Params = { [key: string]: string }

interface Event {
  event: string;
  address: string;
  hash: string;
  params: Params;
}

const transporter = nodemailer.createTransport({
  host: "mail001.dakghar.in",
  port: 25,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

const EventHtml = ({ event, address, hash, params }: Event) => `
<p>
<h2>
  Storx Staking Event
</h2>
<table>
  <tr>
    <td>
      Event Name:
    </td>
    <td>
      ${event.toUpperCase()}
    </td>
  </tr>
  <tr>
    <td>
      User Address:
    </td>
    <td>
      <a href="https://explorer.xinfin.network/addr/${address}" target="_blank">${address}</a>
    </td>
  </tr>
  <tr>
    <td>
      TX hash:
    </td>
    <td>
    <a href="https://explorer.xinfin.network/tx/${hash}" target="_blank">${hash}</a>
    </td>
  </tr>
  ${Object.keys(params).map<string>((x: keyof Params) => {
  return `<tr><td>${String(x).toUpperCase()}</td><td>${params[x]}</td></tr>`;
})}
</table>
</p>`

export const MailEvent = (event: Event) => {
  if (_.isEmpty(recipients) === true) {
    global.logger.error("mail recipients empty")
    return
  }
  global.logger.info(`mailing new event: ${event.event} to recipients from ${process.env.SMTP_USER}`)
  const data = EventHtml(event);
  transporter.sendMail({
    from: "event-bot@storx.io",
    to: recipients,
    subject: "StorX Event",
    html: data,
  }).then(global.logger.debug).catch(global.logger.error)
}