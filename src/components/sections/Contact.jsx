import { contact } from '../../data/site';

export default function Contact() {
  return (
    <section className="contact section-pad" id="contact" aria-labelledby="contact-title">
      <div className="contact__inner">
        <h2 id="contact-title" data-reveal>
          Start a <span>project</span>
        </h2>

        <p className="contact__intro" data-reveal>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <span aria-hidden="true">&middot;</span>
          <a href={contact.phoneHref}>{contact.phoneLabel}</a>
        </p>

        <form
          className="contact__form"
          action={`mailto:${contact.email}`}
          method="post"
          encType="text/plain"
          data-reveal
        >
          <div className="contact__row">
            <label>
              <span>Your Name *</span>
              <input type="text" name="name" autoComplete="name" required />
            </label>
            <label>
              <span>Your Email *</span>
              <input type="email" name="email" autoComplete="email" required />
            </label>
          </div>

          <label>
            <span>Website</span>
            <input type="url" name="website" autoComplete="url" />
          </label>

          <label>
            <span>Your Project *</span>
            <textarea name="project" rows="3" required />
          </label>

          <button type="submit">
            Get in touch <i aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
}
