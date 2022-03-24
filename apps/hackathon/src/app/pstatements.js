import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ptext=[
  ["Productize A Solution","Client",<><p><strong>Context:</strong> Our goal is to drive profitable sustainable growth, so we can reward our people (merit increases and bonus), invest in our future and shape our clients’ transformative journeys. Often times people think of that profitable sustainable growth as coming from specific services or large transformations, but there’s an opportunity to take products and solutions we’ve built for one client and scale them across multiple clients.</p><p>This scenario asks you to think about an existing product or service or create a new one that can be profitably scaled across multiple clients with minimum customization required. This could be something relevant to one industry or multiple industries. It’s up to you to decide!</p>
    <strong>Think about:</strong>
    <ul>
      <li>Which existing services and products or new one can help us generate maximum revenue, with minimum updating and refinement?</li>
      <li>What makes this a scaleable idea?</li>
      <li>How would you value this product?</li>
      <li>How will you determine if this is a good candidate for reuse?</li>
    </ul></>],
  ["Build A Product To Get Customers Back In Stores","Client",<><p><strong>Context:</strong> High streets are dying, malls are emptying, and we all know where most of e-commerce is done, but what will the next normal in retail look like? This is an opportunity to help change already rapidly shifting consumer behaviours. The struggle to remain relevant in this changed environment has never been stronger. Draw on your personal shopping experiences and marry them to your existing PS, business and technology knowledge.</p>
    <p>This scenario asks you to build a digital product as part of an omni-channel experience that gets customers back into stores again</p>
    <strong>The Ask:</strong>
    <ul>
      <li>What digital product (mobile app, IoT products) could enhance the in-store experience? </li>
      <li>What wayfinding and accessibility considerations would you need in-store? </li>
      <li>How can floor staff grow beyond being glorified stockroom hunters and till operators to deliver personalized experiences, or maybe virtual appointments?</li>
    </ul>
  </>],
  ["Build A Data-Driven Digital Government Experience ","",<><p><strong>Context:</strong>In Digital Business Transformation, there’s an inherent trade-off and balance between user-data privacy and effectively gathering and utilizing user-data to facilitate Light, Ethical, Accessible and Dataful (LEAD) experiences and value exchange. Nowhere is this balance trickier than in the Government space. </p>
  <p>This scenario asks you to create a product that could transform a government service. It should incorporate a more personalized experience, while balancing the need for user-data with the right to data-privacy.</p>
  <strong>Think about:</strong><ul>
    <li>How can we engage with government bodies to use CRM, or other methods to rapidly scale their transformation efforts?</li>
    <li>What can we do to drive data-driven personalization for its users? </li>
    <li>What would a highly centralized, coordinated and integrated user-data collection reimagined government look like?</li>
    <li>How would you architect the ultimate digital government of the future?</li>
  </ul></>],
  ["Create An Accelerator For Resposible Investing","Client",<><p><strong>Context:</strong>Invest responsibly. Many are becoming more vocal, are standing up and demanding action on environmental impacts and social causes – this influences the companies and investment products we invest in.</p>
  <p>There’s a growing need for asset and investment managers to know how to tap into various Environmental, Social, and Governance (ESG) data sources to make sound and responsible investment decisions based on ESG ratings and overall governance of companies.</p>
  <p>This scenario asks you to create an accelerator that helps asset managers invest responsibly by connecting different Environmental, Social, and Governance (ESG) data sources (i.e., how sustainable a company is) into a consolidated, normalized, and multi-sourced data set</p>
  <strong>Think about:</strong><ul>
    <li>How can we help asset managers connect to different ESG data providers, map and normalize those data feeds?</li>
    <li>How would you consolidate those data feeds to get at a better, multi-sourced weighted ESG score? </li>
    <li>How would you safeguard against data providers changing in the future and data normalization and weighting changing as well?</li>
    <li>Are there other uses for the data?</li>
    </ul></>],
  ["Sell In The Metaverse","Client",<><p><strong>Context:</strong>What does a Metaverse/AR/MR experience look like for a PS client? Choose a sector and let your imagination run wild. Envisage seeing hotel rooms in all their detail, take a test drive in a smart car that’s not just a demonstration video. Create a virtual world where users can share experiences and interact in real-time within simulated scenario – but not just interact, drive real business value too.</p>
  <p>This scenario asks you to build a Metaverse/AR/MR experience for a Telco, FS, Retail or any other PS client to increase sales or improve service. </p>
  <strong>Think about:</strong><ul>
    <li>Which sector(s) do you think would benefit the most and who would your buyers/users be within those sectors?</li>
    <li>What would the value proposition be to drive sales, create personalization and revolutionize the customer experience?</li>
    <li>What kind of experience would lead to an increase in sales or improvement in service and how?</li>
  </ul></>],
  ["Personalize the PublicisSapient.com Experience","Client",<><p><strong>Context:</strong>With over 1,000 pieces of content added every week to www.publicissapient.com, we have a growing need for our key audiences (prospects, clients, people – our WHO) to be able to access highly engaging, topically-relevant and timely content. </p>
  <p>Our content is immersive, informative, and presents our unique business perspective (our WHAT), but also shows how we think and operate (our HOW). </p>
  <p>At present, our content can only be accessed via user directed navigation, direct page links, or a basic search engine. This access is limiting not only from a user experience standpoint, but also for Publicis Sapient in exposing or amplifying our value proposition. </p>
  <p>This scenario asks you to create a personalized experience for different audiences to discover, engage, and amplify the most relevant and immersive content on our PS website </p>
  <strong>Think about:</strong><ul>
    <li>Who are the target audiences internally and externally?</li>
    <li>How can we use this customer experience to glean insights on what is the most important content, themes, formats, and features for our audiences? </li>
    <li>How can we use personalization and choose the best channels (e.g., emails, website, etc.) to better target large publishers/media companies, for both internal & external audiences across channels?</li>
    <li>How do we give our audience the tools to engage and amplify our content and be PS brand champions?</li>
    </ul></>],
  ["Activate The Publicis Sapient Alumni Experience","Client",<><p><strong>Context:</strong>People who leave Publicis Sapient often carry very good impressions of their time with us, around their learnings, progression, people they’ve worked with, our culture, our policies, clients and impact we have on the world. </p>
  <p>We have a tremendous opportunity to leverage this goodwill and encourage people to come back to join Publicis Sapient or continue to engage with us as their partner. We currently don’t do anything to actively engage them and believe it is a lost opportunity.</p>
  <p>This scenario asks you to create an alumni network that establishes an active, ongoing connection and engagement with our alumni</p>
  <strong>Think about:</strong><ul>
    <li>What outcomes are you designing for in your solution?</li>
    <li>What makes for an engaging digital alumni experience?</li>
    <li>How would you keep them posted on interesting happenings at PS and share content that’s publicly available including our conferences, blogs and podcasts? </li>
    <li>How could you engage them in exclusive content and events? What would an alumni event look like?</li>
    </ul></>],
  ["Design A Way To Create Informal Digital Connections","Client",<><p><strong>Context:</strong>Opportunities to have learning through observation and casual mentoring are lacking in a WFH world, but super critical for early career professional development. </p>
  <p>It also supports retention by feeling connected to our purpose and culture and is an integral part of the initial hiring process. </p>
  <p>This scenario asks you to create a product or platform that connects two groups of PS people–new joiners and established colleagues for casual meetups and networking</p>
  <strong>Think about:</strong><ul>
    <li>How can we use people movement trends, outlook calendars, and office location data to facilitate informal connections as we scale and move to a hybrid return to office?</li>
    <li>What can we do to make it relevant to our Early Careers cohort, new joiners and, well, everybody? </li>
    </ul></>],
  ["Create a Platform for Digital Disaster Relief","CORPORATE SOCIAL RESPONSIBILITY",<><p><strong>Context:</strong>During global crises like Covid-19 or wars, many voluntary organizations need to connect volunteers who want to donate food, supplies, services or time to people in need e.g., displaced citizens or the vulnerable shielding at home from Covid in remote areas.</p>
  <p>This scenario asks you to create a scalable, open-source product to help people connect to aid, resources and intermediaries during a natural or humanitarian disaster</p>
  <strong>Think about:</strong><ul>
    <li>Think big. What role can a digital solution play in disaster relief?</li>
    <li>What audiences are you serving and how? How will this help the recipients of the relief?</li>
    <li>How can information be updated in real time for maximum, swift impact?</li>
    <li>•	Create an open source, white-labelled solution that can be used internally for PS4U and similar initiatives, but can also be given to external organizations</li>
    </ul></>],
];

export default function ProblemStatements() {
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div>
      <Typography variant="h4">Intro:</Typography>
      <Typography variant='body1'>Even though these Scenarios neatly fall into different buckets (Client, Internal, Corporate Social Responsibility)
         the underlying theme running through them all is reusability and scalability. While some of the scenarios are really
         vast to explore, think about how to narrow in on actionable, impactful solutions that can solve parts of the scenario
         you select. We can create meaningful and impactful solutions, but your best and brilliant ideas also need to help us
          sustain and push growth – people growth, technological growth and revenue growth. Good luck!</Typography>
      {ptext.map((p,i)=>(
      <Accordion expanded={expanded === `p${i}`} onChange={handleChange(`p${i}`)}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`p${i}-content`}
          id={`p${i}-header`}
        >
          <Typography sx={{ width: '100%', flexShrink: 0 }}>
           <strong>{i+1}</strong>&nbsp; {p[0]}
          </Typography>
          {/* <Typography sx={{ color: 'text.secondary' }}>{p[1]}</Typography> */}
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            {p[2]}
          </Typography>
        </AccordionDetails>
      </Accordion>
      ))}
    </div>
  )
}
