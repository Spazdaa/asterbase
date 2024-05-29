/**
 * Privacy Policy.
 */

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "landingPage/components/Footer";

import AlphaTag from "components/AlphaTag";
import logo from "img/logo_large_transparent.png";

function PrivacyPolicy(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <main className="bg-white">
      <header
        onClick={() => {
          navigate("/");
        }}
        className="flex items-center hover:cursor-pointer"
      >
        <img src={logo} alt="logo" className="my-8 ml-8 mr-4 w-8" />
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-900 my-12 mr-2">
            Asterspark
          </h1>
          <div className="flex-start">
            <AlphaTag />
          </div>
        </div>
      </header>
      <div className="w-4/5 lg:w-3/5 flex flex-col mx-auto py-12 gap-7">
        <h1 className="text-center">
          <b>PRIVACY POLICY</b>
        </h1>
        <p>Last Modified: August 15, 2023</p>
        <p>
          Asterbase Labs Ltd. (“<b>Asterbase</b>”, “<b>we</b>”, “<b>us</b>” or “
          <b>our</b>”) is a corporation formed pursuant to the{" "}
          <i>Business Corporations Act</i> (Alberta). Further to our Terms and
          Conditions of Use (
          <a
            href="https://asterspark.com/terms"
            className="underline text-blue-600"
          >
            https://asterspark.com/terms
          </a>
          ) (the “<b>Terms</b>”), this Privacy Policy sets out how we collect,
          store and use personal information and cookies. Unless otherwise
          indicated, any capitalized terms in this Privacy Policy have the same
          meaning attributed to them in our Terms.
        </p>
        <p>
          By agreeing to our Terms or by using the Asterspark Platform, you
          consent to the collection and use of personal information in
          accordance with this Privacy Policy, which we may update from time to
          time by posting an updated version of the policy on our website. Your
          continued use of the Asterspark Platform thereafter will constitute
          your consent to such changes. If you do not consent to such changes,
          you may cancel your account. We may also undertake to provide you with
          notice of significant updates to this Privacy Policy by email, if you
          are an existing Asterspark Platform subscriber at the time of the
          update.
        </p>
        <b>PART I: COLLECTION OF PERSONAL INFORMATION</b>
        <b>The Personal Information of Other Individuals</b>
        <p>
          To the extent you provide us with, or upload data that includes the
          personal information of another individual, you represent and warrant
          that you have that individual&apos;s consent to provide us with their
          information to use in accordance with this Privacy Policy and our
          Terms. If you do not have their consent, you agree not to upload or
          provide us with any such personal information.
        </p>
        <p>
          To establish an account with us or use our Asterspark Platform, we (or
          our third-party providers) may collect, or you may be asked to
          provide, the following personal information:
        </p>
        <ul className="ml-12 list-disc">
          <li>Full name;</li>
          <li>Age;</li>
          <li>Billing Address;</li>
          <li>Email address;</li>
          <li>
            Credit card information (collected via a third party identified
            below);
          </li>
          <li>
            Comments, feedback, reviews and other information you upload or
            provide to the Asterspark Platform;
          </li>
          <li>
            Internet Protocol (“IP”) address and corresponding location data;
          </li>
          <li>
            Website statistics and analytics data regarding your use of the
            Asterspark Platform;
          </li>
          <li>
            Other types of raw data relating to how you interact with the
            Asterspark Platform, for example, your browser information and
            session duration;
          </li>
          <li>Profile photos (where you elect to upload them); and</li>
          <li>
            All other information you elect to provide to us, either on the
            Asterspark Platform or otherwise.
          </li>
        </ul>
        <b>Social Media Account Login Providers</b>
        <p>
          Where you elect to create an account using a social media account
          login provider, for example, Google or GitHub, you agree and
          acknowledge that they may provide us with certain profile and account
          information to establish your account.
        </p>
        <b>Payment Processing</b>
        <p>
          We may also collect credit card and payment information from you via a
          third-party payment processor. As of the last date this Privacy Policy
          was updated, we use Stripe, Inc., Stripe Payments Canada, Ltd. and
          their respective worldwide affiliates. See their privacy policy for
          details at{" "}
          <a
            href="https://stripe.com/en-ca/privacy"
            className="underline text-blue-600"
          >
            https://stripe.com/en-ca/privacy
          </a>
          .
        </p>
        <p>
          Although we may display their forms on or in connection with the
          Asterspark Platform, when you provide your payment details on or via
          the platform, you are providing them to the applicable payment
          processor. You acknowledge that our third-party payment processors may
          have their own agreements and policies which apply to you. While we
          will not have access to your entire credit card number, we will be
          able to bill your credit card and may have access to certain card and
          payment details such as the name on your card, billing address and
          card expiration date. If you have questions regarding our payment
          processor, please contact us.
        </p>
        <b>PART II: THE USE OF PERSONAL INFORMATION</b>
        <p>
          We do not sell personal information to third-parties. However, we may
          use personal information to:
        </p>
        <ul className="ml-12 list-disc">
          <li>
            Facilitate the operation of the Asterspark Platform, including
            sharing or providing access to personal information to Third-Party
            Providers, see below for details;
          </li>
          <li>Bill and collect money owed to us;</li>
          <li>Verify your contact information;</li>
          <li>
            Provide user support or to support and improve the Asterspark
            Platform;
          </li>
          <li>Communicate with you about your account or services we offer;</li>
          <li>
            Send or display informational and promotional materials about the
            Asterspark Platform. You may unsubscribe from such communications at
            any time;
          </li>
          <li>
            Pursue available legal remedies to us and to prosecute or defend a
            court, arbitration or similar proceeding;
          </li>
          <li>
            To meet legal requirements or seek legal, tax or other professional
            advice in connection with your use of our Asterspark Platform; and
          </li>
          <li>
            To enforce compliance with our Terms and applicable laws, rules and
            regulations.
          </li>
        </ul>
        <b>PART III: THE DISCLOSURE OF PERSONAL INFORMATION</b>
        <b>Sharing Personal Information and Content if Required by Law</b>
        <p>
          We may share personal information and any content collected, uploaded
          or provided to us if required by law, such as in response to a
          subpoena, court order or other legal process in any jurisdiction. If
          we are required by law to make any disclosure of your personal
          information or content, we may, but are not obligated to, provide you
          with written notice of such disclosure, if permitted by law.
        </p>
        <b>
          Sharing Personal Information to Cooperate with Investigations and Law
          Enforcement
        </b>
        <p>
          Absent a court order, subpoena or other legal requirement to disclose
          personal information or content in our possession or control, you
          agree that we may also share personal information and content you
          upload or which is associated with your account to cooperate with law
          enforcement authorities in the investigation of any criminal matter if
          we reasonably believe doing so is necessary or beneficial in
          protecting your safety, or the safety of any third-party.
        </p>
        <b>Sharing Personal Information with Third-Party Providers</b>
        <p>
          Our suppliers, partners, independent contractors (collectively “
          <b>Third-Party Providers</b>”) and/or employees, may have access to,
          or be shared personal information to use in connection with one or
          more of the purposes for which the information was collected.
        </p>
        <p>
          Our Third-Party Providers may have access to personal information (or
          the Asterspark Platform may push and pull data that includes your
          personal information) in providing services to us, or providing you
          with access to the Asterspark Platform. We may use a variety of
          Third-Party Providers in order to host the Asterspark Platform and
          facilitate their ordinary use, including for example, hosting servers
          which store personal information.
        </p>
        <p>
          As of the last revision date of this Privacy Policy, among others, we
          use the following Third-Party Providers who may have access to,
          provide us with, or store your personal information, by virtue of our
          use of their services:
        </p>
        <ul className="ml-12 list-disc">
          <li>
            Our email and data hosting providers include Google LLC together
            with their affiliated entities worldwide. For more information on
            their privacy practices please see{" "}
            <a
              href="https://policies.google.com"
              className="underline text-blue-600"
            >
              https://policies.google.com
            </a>
            .
          </li>
          <li>
            Our database providers include MongoDB, Inc. together with their
            affiliated entities worldwide. For more information on their privacy
            practices please see{" "}
            <a
              href="https://www.mongodb.com/legal/privacy-policy"
              className="underline text-blue-600"
            >
              https://www.mongodb.com/legal/privacy-policy
            </a>
            .
          </li>
          <li>
            Our text message communication providers include Twilio Inc.
            together with their affiliated entities worldwide. For more
            information on their privacy practices please see{" "}
            <a
              href="https://www.twilio.com/en-us/legal/privacy"
              className="underline text-blue-600"
            >
              https://www.twilio.com/en-us/legal/privacy
            </a>
            .
          </li>
          <li>
            Our automated and bulk email provider includes SendGrid, which is
            also offered by Twilio Inc. together with their affiliated entities
            worldwide. For more information on their privacy practices please
            see{" "}
            <a
              href="https://www.twilio.com/en-us/legal/privacy"
              className="underline text-blue-600"
            >
              https://www.twilio.com/en-us/legal/privacy
            </a>
            .
          </li>
        </ul>
        <p>
          We also use the following Third-Party Providers for data analytics and
          social media integration in connection with your use of our Asterspark
          Platform:
        </p>
        <ul className="ml-12 list-disc">
          <li>
            Google LLC together with their affiliated entities worldwide, in
            order to use Google Analytics. For details, visit{" "}
            <a
              href="https://analytics.google.com/analytics/web/"
              className="underline text-blue-600"
            >
              https://analytics.google.com/analytics/web/
            </a>
            .
          </li>
          <li>
            Meta Pixel, offered by Meta Platforms, Inc., and their affiliated
            and related entities, which provides us with analytics and insights
            into your use of our website and third party website. If you are a
            Facebook or Instagram user, Meta Pixel helps us target advertising
            to you via Facebook and Instagram based on the various pages you
            visit on our website. For more information about Meta Pixel, see{" "}
            <a
              href="https://www.facebook.com/business/learn/facebook-ads-pixel"
              className="underline text-blue-600"
            >
              https://www.facebook.com/business/learn/facebook-ads-pixel
            </a>
            . We may also use Facebook and Instagram APIs to fetch your profile
            information.
          </li>
        </ul>
        <p>
          If you elect to integrate your Notion account (an online software
          offered by Notion Labs, Inc.), we may also push and pull your
          information to and from Notion. Their privacy policy is available
          online at{" "}
          <a
            href="https://www.notion.so/Terms-and-Privacy-28ffdd083dc3473e9c2da6ec011b58ac"
            className="underline text-blue-600"
          >
            https://www.notion.so/Terms-and-Privacy-28ffdd083dc3473e9c2da6ec011b58ac
          </a>
          .
        </p>
        <p>
          If you elect to integrate your Evernote account (an online software
          offered by Evernote Corporation and their affiliated entities
          worldwide) we may also push and pull your information to and from
          Evernote. Their privacy policy is available online at{" "}
          <a
            href="https://evernote.com/privacy/policy"
            className="underline text-blue-600"
          >
            https://evernote.com/privacy/policy
          </a>
          .
        </p>
        <p>
          If you elect to integrate your Trello account (an online software
          offered by Trello, Inc. and their affiliated entities worldwide) we
          may also push and pull your information to and from Trello. Their
          privacy policy is available online at{" "}
          <a
            href="https://support.atlassian.com/trello/docs/privacy/"
            className="underline text-blue-600"
          >
            https://support.atlassian.com/trello/docs/privacy/
          </a>
          .
        </p>
        <p>
          To interact with users, we also have a Discord channel (see{" "}
          <a
            href="https://discord.com/invite/r5z6TUjhkH"
            className="underline text-blue-600"
          >
            https://discord.com/invite/r5z6TUjhkH
          </a>
          ). We use Discord for general conversations with users (or prospective
          users), making announcements, obtaining feedback, reporting bugs,
          receiving feature suggestions and other topics. Discord&apos;s privacy
          policy is available online at{" "}
          <a
            href="https://discord.com/privacy"
            className="underline text-blue-600"
          >
            https://discord.com/privacy
          </a>
          .
        </p>
        <p>
          We may update the above list of Third-Party Providers from
          time-to-time as the Asterspark Platform continues to evolve.
          Third-Party Providers may have their own agreements and privacy
          policies on the collection and use of personal information which
          either we or you provide them.
        </p>
        <b>Your Personal Information May Not Be Stored in Canada</b>
        <p>
          As we may have servers, Third-Party Providers, employees and other
          parties we share your personal information with in locations both
          inside and outside of Canada, your personal information may become
          subject to foreign laws and foreign legal proceedings.
        </p>
        <b>European General Data Protection Regulation</b>
        <p>
          Our privacy practices intend to meet the requirements of the General
          Data Protection Regulation of the European Union (“<b>GDPR</b>”). As a
          company that may process the personal information of persons who
          reside in or who are citizens of the European Union (a “
          <b>European person</b>”), we have implemented technical and
          organizational measures to meet the GDPR&apos;s requirements and
          protect the personal information of European persons. Our technical
          measures to protect personal information take into account current
          technology available and the costs of implementing that technology in
          addition to the nature, scope, context and purposes of the personal
          information collected and processed. If you have any questions about
          our technical and organizational measures to meet the GDPR
          requirements, please contact us.
        </p>
        <p>
          If you provide us with personal information from European persons, you
          represent and warrant to us that your personal information collection
          and storage procedures comply, at all times, with the GDPR. To the
          extent you provide us with, or, have our Website process any personal
          information of a European person, you further represent that you have
          obtained informed consent to transfer their information,
          internationally, to us. If such consent is subsequently revoked, you
          agree to inform us immediately. Provided we are a company registered
          and operating in Canada, you agree and acknowledge that your personal
          information will be accessed by us in Canada, although it may be
          stored with Third Party Providers in locations both in and outside of
          Canada.
        </p>
        <b>
          Sharing Personal Information if Our Business, Asterspark Platform is
          Acquired
        </b>
        <p>
          We may share personal information with our successors (if our business
          or the Asterspark Platform is acquired by another legal entity) or any
          assignee of our assets relating to the Asterspark Platform. Disclosure
          in such circumstances is governed by the{" "}
          <i>Personal Information Protection and Electronic Documents Act</i>,
          SC 2000, c 5 in Canada.
        </p>
        <b>Disclaimer and Warning About Sharing Personal Information Online</b>
        <b>
          YOU ACKNOWLEDGE THAT WHEN SHARING PERSONAL INFORMATION ONLINE, THERE
          IS ALWAYS A RISK OF DATA BREACHES, INCLUDING DATA BREACHES IN WHICH
          THIRD PARTIES UNLAWFULLY ACCESS OUR SYSTEMS, OR THE SYSTEMS OF OUR
          THIRD-PARTY PROVIDERS, WHICH STORE PERSONAL INFORMATION.
        </b>
        <b>
          WHILE WE TAKE MEASURES TO PROTECT PERSONAL INFORMATION, YOU AGREE
          THAT, TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL WE, OUR
          AFFILIATES, OFFICERS, DIRECTORS, SHAREHOLDERS, EMPLOYEES, CONTRACTORS,
          AGENTS, THIRD-PARTY PROVIDERS OR LICENSORS BE LIABLE, HOWSOEVER
          CAUSED, INCLUDING BY WAY OF NEGLIGENCE, FOR THE LOSS OR THEFT OF YOUR
          PERSONAL INFORMATION OR ANY DAMAGES CAUSED AS A RESULT THEREOF, SO
          LONG AS WE WERE NOT DIRECTLY AND GROSSLY NEGLIGENT IN THE PROTECTION
          OF SAID INFORMATION.
        </b>
        <b>Retention of Your Personal Information</b>
        <p>
          We keep your personal information for as long as it is required for
          the purpose for which it was collected. There is no single retention
          period applicable to the various types of personal information
          collected. However, if you delete your account (or you are otherwise
          removed from the Asterspark Platform) we may delete your account
          information and all data stored in connection with your account.
        </p>
        <p>
          Please contact us if you would like to delete any specific personal
          information we hold about you following the termination of your
          account.
        </p>
        <b>PART IV: Our Use of Cookies</b>
        <p>
          By using our Asterspark Platform, you consent to our use of cookies.
          This cookies policy explains what cookies are, how we use them and how
          Third-Party Providers may also use cookies on, or in connection with
          our Asterspark Platform.
        </p>
        <b>What are Cookies?</b>
        <p>
          Cookies are small text files sent to and automatically downloaded by
          your web browser (assuming you have cookies enabled) when you visit
          the Asterspark Platform. A cookie file is stored in your web browser
          and allows the Asterspark Platform and Third-Party Providers we use to
          recognize you, track your activity across our and other websites and
          is usually used in conjunction with logging your internet protocol
          (“IP”) address.
        </p>
        <p>
          Cookies can be &quot;persistent&quot; or &quot;session&quot; cookies.
          Persistent cookies remain on your computer (in your browser files) or
          mobile device when you go offline, while session cookies are deleted
          as soon as you close your web browser.
        </p>
        <b>Can you block the use of Cookies?</b>
        <p>
          Most web browsers allow you to disable the use of cookies. However,
          certain components of the Asterspark Platform may not operate
          properly, and you may not be able to access and use the Asterspark
          Platform if you disable cookies.
        </p>
        <b>Can you delete Cookies once downloaded?</b>
        <p>
          Most web browsers also permit you to delete cookies. This is typically
          done via your web browser&apos;s settings, which vary depending on
          which web browser you use.
        </p>
        <b>How we use Cookies</b>
        <p>
          Our use of cookies is primarily to analyze how you use the Asterspark
          Platform, for instance which pages you visit most often and where you
          found our various web pages online. This helps us better understand
          your user experience and other statistics which we may use to provide
          a better user experience in future updates.
        </p>
        <p>
          For example, cookies are used in connection with our use of Google
          LLC&apos;s Google Analytics. For more information on Google Analytics
          and how cookies are used by Google Analytics, see Google LLC&apos;s
          information page at{" "}
          <a
            href="https://developers.google.com/analytics/devguides/collection/analyticsjs/cookie-usage"
            className="underline text-blue-600"
          >
            https://developers.google.com/analytics/devguides/collection/analyticsjs/cookie-usage
          </a>
          .
        </p>
        <p>
          We, or Third-Party Providers we use to enable cookies, may also use
          cookies on or in connection with the Asterspark Platform to:
        </p>
        <ul className="ml-12 list-disc">
          <li>Remember choices you have made on the Asterspark Platform;</li>
          <li>Authenticate or authorize users;</li>
          <li>Determine whether a user has an active subscription;</li>
          <li>
            Target advertising or to customize advertising across various
            websites (not just our own) and make such advertisements more
            relevant to you. For example, Meta Pixel may be used to track your
            activity across various websites.
          </li>
        </ul>
        <p>
          If you believe that we have not adhered to this Privacy Policy or
          would like to request an amendment to personal information being held
          by us, please contact us by e-mail at{" "}
          <a
            href="mailto:asterbasehq@gmail.com"
            className="underline text-blue-600"
          >
            asterbasehq@gmail.com
          </a>
          .
        </p>
      </div>
      <Footer />
    </main>
  );
}

export default PrivacyPolicy;
