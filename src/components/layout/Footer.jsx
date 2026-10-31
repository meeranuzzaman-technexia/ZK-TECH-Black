import { contact, footerLinks, heroIntro } from '../../data/site';

export default function Footer() {
  return (
    <footer className="footer section-pad">
      <div className="footer__grid">
        <div className="footer__brand">
          <img src="/images/zk-mark.png" alt="ZK Tech Solutions" />
          <p>{heroIntro}</p>
        </div>

        <nav aria-label="Company">
          <span>Company</span>
          {footerLinks.company.map((link) => (
            <a href={link.href} key={link.label}>{link.label}</a>
          ))}
        </nav>

        <nav aria-label="Services">
          <span>Services</span>
          {footerLinks.services.map((link) => (
            <a href={link.href} key={link.label}>{link.label}</a>
          ))}
        </nav>

        <nav aria-label="Social media">
          <span>Social</span>
          <a href={contact.instagram}>Instagram</a>
          <a href={contact.facebook}>Facebook</a>
        </nav>
      </div>

      <div className="footer__meta">
        <p>©{new Date().getFullYear()} ZK Tech Solutions</p>
        <p>Richmond, Texas</p>
        <a href="#top">Back to top ↑</a>
      </div>

      {/* <div className="footer__wordmark" aria-hidden="true">ZK</div> */}
    </footer>
  );
}
