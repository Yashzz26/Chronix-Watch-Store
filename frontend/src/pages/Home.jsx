import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLongRight } from 'react-icons/hi2';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import useCartStore from '../store/cartStore';
import WatchModel from '../components/ui/WatchModel';
import SkeletonHero from '../components/ui/SkeletonHero';
import NewArrivals from '../components/NewArrivals';
import './home.css';

const stats = [
  {
    value: '48 hrs',
    label: 'Service response',
    detail: 'Average support ticket resolution time this quarter.'
  },
  {
    value: '850+',
    label: 'Repairs handled',
    detail: 'Completed at our Mumbai workshop since 2018.'
  },
  {
    value: '2 yrs',
    label: 'Warranty coverage',
    detail: 'Movement + water resistance included with every watch.'
  }
];

const highlights = [
  {
    tag: 'Regulated in-house',
    title: 'Honest automatic movements',
    description: 'Every automatic ships with a regulated NH35 tuned to +/-10 seconds a day before it leaves our bench.'
  },
  {
    tag: 'Daily wear',
    title: 'Comfort-first bracelets',
    description: 'Solid links, chamfered edges, and five micro-adjust points keep the fit light even in humid weather.'
  },
  {
    tag: 'Readable dials',
    title: 'No-nonsense typography',
    description: 'Applied markers, AR-coated sapphire, and restrained text so you can read the time at a glance.'
  }
];

const materials = [
  {
    title: '316L stainless steel',
    description: 'Hypoallergenic steel with brushed and polished surfaces that can be refinished years later.'
  },
  {
    title: 'Sapphire crystal',
    description: 'Double-domed with clear anti-reflective coating to keep glare down indoors and outside.'
  },
  {
    title: 'Vegetable-tanned leather',
    description: 'Sealed edges and quick-release pins for humid days and easy swaps.'
  },
  {
    title: 'Seiko NH35 movement',
    description: 'Serviceable, dependable, and easy to regulate anywhere in the world.'
  }
];

const stories = [
  {
    title: 'Design notes',
    description: 'A short read on how we slimmed the bezel and dial text for the new Classic Series.',
    link: '/about'
  },
  {
    title: 'Ownership checklist',
    description: 'What we inspect before shipping and how to keep the watch looking fresh.',
    link: '/allcollection'
  },
  {
    title: 'Service promise',
    description: 'Plain-language coverage for the included two-year warranty.',
    link: '/about'
  }
];

export default function Home() {
  const addItem = useCartStore((state) => state.addItem);
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(8));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setDbProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, []);

  const newArrivals = useMemo(() => dbProducts.slice(0, 4), [dbProducts]);

  return (
    <div className="home">
      {loading ? (
        <SkeletonHero />
      ) : (
        <section className="home-hero">
          <div className="container home-hero__grid">
            <div>
              <p className="home-eyebrow">Spring 2026 drop</p>
              <h1 className="home-hero__title">Watches built to be worn, not stored.</h1>
              <p className="home-lead">
                Less manifesto, more clarity. We design everyday watches with serviceable parts, realistic pricing,
                and support that writes back in plain language.
              </p>
              <div className="home-hero__actions">
                <Link to="/allcollection" className="btn-chronix btn-chronix-primary">
                  Shop the line
                </Link>
                <Link to="/about" className="home-hero__link">
                  Meet the workshop <HiArrowLongRight size={20} />
                </Link>
              </div>
            </div>
            <div className="home-hero__visual">
              <div className="home-hero__badge">Ships free across India</div>
              <div className="home-hero__canvas">
                <WatchModel />
              </div>
              <p className="home-hero__note">Rendered from the same CAD file we hand off to production.</p>
            </div>
          </div>
        </section>
      )}

      <section className="home-section">
        <div className="container home-stat-grid">
          {stats.map((stat) => (
            <article key={stat.label} className="home-stat">
              <div className="home-stat__value">{stat.value}</div>
              <div className="home-stat__label">{stat.label}</div>
              <p className="home-stat__detail">{stat.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <NewArrivals products={newArrivals} loading={loading} addItem={addItem} />

      <section className="story-section">
        <div className="container">
          <div className="story-grid">
            <div className="story-image">
              <img src="/assets/images/mechanism.png" alt="Macro photograph of a Chronix watch movement" loading="lazy" />
            </div>
            <div className="story-content">
              <p className="tag">HOROLOGICAL STORY</p>
              <h2>Crafting the Second.</h2>
              <p>
                Every Chronix watch is a result of hours of design and engineering. We believe that a timepiece
                shouldn&apos;t just tell time — it should embody it.
              </p>
              <button className="secondary-btn">READ OUR STORY</button>
            </div>
          </div>
        </div>
      </section>

      <section className="story-section">
        <div className="container">
          <div className="story-grid reverse">
            <div className="story-content">
              <p className="tag">MATERIAL MATTERS</p>
              <h2>Built to Last.</h2>
              <p>
                We source high-grade materials and engineer every component for durability, precision, and long-term
                performance.
              </p>
              <div className="specs">
                <span>10 ATM</span>
                <span>72 HRS</span>
              </div>
            </div>
            <div className="story-image">
              <img src="/assets/images/watchmaker.png" alt="Chronix watchmaker assembling a case" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <div className="home-section__header">
            <p className="home-eyebrow">Why Chronix</p>
            <h2>Everyday details we refuse to skip.</h2>
            <p className="home-lead">
              Clear copy, grounded materials, and a support team that replies within two business days.
            </p>
          </div>
          <div className="home-highlight-grid">
            {highlights.map((item) => (
              <article key={item.title} className="home-highlight-card">
                <span className="tag">{item.tag}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <div className="home-section__header">
            <p className="home-eyebrow">Materials</p>
            <h2>Tools first, luxury second.</h2>
            <p className="home-lead">Everything we use can be serviced locally. No mystery alloys or glued parts.</p>
          </div>
          <div className="home-material-grid">
            {materials.map((item) => (
              <article key={item.title} className="home-material-card">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-stories">
        <div className="container">
          <div className="home-section__header">
            <p className="home-eyebrow">Notes from the bench</p>
            <h2>Short reads, zero fluff.</h2>
          </div>
          <div className="home-stories__grid">
            {stories.map((story) => (
              <article key={story.title} className="home-story-card">
                <h3>{story.title}</h3>
                <p>{story.description}</p>
                <Link to={story.link} className="subtle-link">
                  Keep reading <HiArrowLongRight size={18} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-cta">
        <div className="container">
          <div className="cta-card">
            <p className="home-eyebrow">Ready when you are</p>
            <h2>Book a video sizing or drop by the studio.</h2>
            <p className="home-lead">
              Put the watch on alongside our team, ask honest questions, and only check out when it feels right.
            </p>
            <div className="home-hero__actions home-hero__actions--center">
              <Link to="/about" className="btn-chronix btn-gold">
                Book a fitting
              </Link>
              <Link to="/allcollection" className="home-hero__link">
                Browse the catalog <HiArrowLongRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


