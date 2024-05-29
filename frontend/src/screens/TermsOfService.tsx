/**
 * Terms of Service.
 */

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "landingPage/components/Footer";

import AlphaTag from "components/AlphaTag";
import logo from "img/logo_large_transparent.png";

function TermsOfService(): JSX.Element {
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
          <b>TERMS AND CONDITIONS OF USE</b>
        </h1>
        <p>Last Modified: August 15, 2023</p>
        <p>
          Asterbase Labs Ltd. (“<b>Asterbase</b>
          ”, &quot;<b>we</b>&quot;, &quot;<b>us</b>&quot; or &quot;<b>our</b>
          &quot;) is a corporation formed pursuant to the{" "}
          <i>Business Corporations Act</i> (Alberta). In consideration for
          permitting your access to our website and online services and other
          good and valuable consideration, you agree as follows:
        </p>
        <p>
          These terms and conditions (the &quot;<b>Terms</b>&quot;) form a
          legally binding agreement which govern your access to and use of our
          website and our corresponding web-app used for learning tech skills
          hosted at{" "}
          <a href="https://asterspark.com/" className="underline text-blue-600">
            https://asterspark.com/
          </a>
          . Collectively the website and web-app are referred to in these Terms
          as the “<b>Asterspark Platform</b>”.
        </p>
        <p>
          <b>
            These Terms have provisions which limit our liability and impose
            obligations on you.
          </b>{" "}
          You must review these Terms carefully before using the Asterspark
          Platform. By using Asterspark Platform, you, the user (&quot;
          <b>you</b>&quot; or &quot;<b>your</b>&quot;), represent and warrant
          that (i) you are at least 18 years old; and (ii) you have read and
          understand these Terms and agree to be bound by them.
        </p>
        <p>
          If you are using the Asterspark Platform on behalf of, or in the
          employ of, an organization (corporation, trust, partnership, etc.),
          you are agreeing to these Terms for that organization and representing
          and warranting that you have the authority to bind that organization
          to these Terms. In such a case, &quot;you&quot; and &quot;your&quot;
          will also refer to that organization and yourself individually. For
          greater clarity, both you as an individual and your organization are
          legally bound by these Terms which form an agreement between you and
          Asterbase Labs Ltd.
        </p>
        <b>AMENDMENTS</b>
        <p>
          As the Asterspark Platform continues to evolve, we may, at any time,
          revise these Terms and our policies by updating this page or the page
          hosting the relevant policy. The date of the last version of these
          Terms is posted above. As you are bound by these Terms each time you
          use the Asterspark Platform, you are responsible for periodically
          reviewing the amendments to these Terms and you are deemed to have
          accepted and agreed to such amendments by accessing and using the
          Asterspark Platform after such amendments have been posted. If you do
          not agree with the amendments, you shall immediately stop accessing
          the Asterspark Platform and terminate your account (and corresponding
          subscription), subject to the terms provided for herein. We may also
          undertake to send you an email or display notice of any changes to the
          Terms or policies in your account.
        </p>
        <b>PRIVACY</b>
        <p>
          We use personal information you provide us in accordance with our
          privacy policy, which is incorporated by reference and available
          online at{" "}
          <a
            href="https://asterspark.com/privacy"
            className="underline text-blue-600"
          >
            https://asterspark.com/privacy
          </a>
          . By using the Asterspark Platform, you consent to such processing and
          you represent to us that all information provided by you is accurate.
        </p>
        <b>About Our Online Service</b>
        <p>
          The Asterspark Platform is an online tool to learn and improve tech
          skills, including the areas of web development, data science, game
          development and machine learning. See our website for further details
          on the current features and functionality.
        </p>
        <b>Establishing an Account</b>
        <p>
          To use the Asterspark Platform you will be required to register an
          account and provide certain personal information as referenced in our
          privacy policy. We may also allow you to create an account via third
          party providers such as Google, GitHub and others. If you elect to
          establish your account via a third party provider, you permit us to
          collect the personal information such a third party sends us to
          establish your account.
        </p>
        <p>
          Regardless of whether you pay for your account or not (for example we
          may offer you a free trial to get started), you agree that access to
          your account constitutes good and valuable consideration in exchange
          for agreeing to these Terms, our privacy policy and all other
          documents and policies incorporated by reference.
        </p>
        <p>
          Upon establishing an account, we grant you a non-transferable,
          non-exclusive license to access the Asterspark Platform in accordance
          with these Terms. However, we reserve the right to revoke that license
          and your access to the Asterspark Platform without justification or
          cause, at any time. We make no representations or warranties as to the
          ongoing availability of the Asterspark Platform, or your access to it.
        </p>
        <b>Account Not Transferable</b>
        <p>
          Access to your account is not transferable and is only intended for
          you, the individual who established the account, even if your account
          is paid for or made accessible to you by an organization (such as your
          employer or other third party). As a result, you are not permitted to
          change the name associated with your account.
        </p>
        <b>Account Security</b>
        <p>
          Unless you use a third-party sign-in provider, upon setting up an
          account, you will be required to create a username and password. In
          any event, you are responsible for safeguarding the password you use
          to access the Asterspark Platform and you agree not to disclose your
          password to any third-party.
        </p>
        <p>
          You agree to use a unique password for your account which you do not
          use for any other online service. As we may send password reset
          notices and links to your email account and/or mobile phone number
          registered on the Asterspark Platform (i) you are responsible for
          ensuring that your email address and phone number (if applicable)
          provided to us are accurate; and (ii) you represent and warrant to us,
          and agree that you will ensure, you are the sole person, at all times,
          with access to the email account (and if applicable, the third-party
          sign-in provider account) you use to access your account on the
          Asterspark Platform.
        </p>
        <p>
          You agree you are responsible for any activity on your account and all
          correspondence provided to us from any email address or phone number
          used to register your account, whether or not you authorized that
          activity or correspondence. You agree that we are, in respect of any
          instructions or actions taken by a person using your account, entitled
          to assume that the person is you; the person whose name and personal
          information is registered and associated with the account.
        </p>
        <p>
          You must immediately notify us of any unauthorized use of your
          account.
        </p>
        <p>
          You must inform us of any changes to your contact details and other
          information provided to us, including, but not limited to, your email
          address and telephone number.
        </p>
        <p>
          While we and our third party software and technology providers take
          certain security measures in relation to the Asterspark Platform, you
          acknowledge that the technical processing and transmission of the
          Asterspark Platform and related data and information, including your
          own account data and information, will involve transmissions over
          various networks and devices, including networks and devices not owned
          or controlled by us. We rely on a number of third parties to make the
          Asterspark Platform available, including data and web hosting
          providers. You accept all risks in using the Asterspark Platform and
          you agree and acknowledge that in using online platforms, there is
          always a risk of unauthorized access to and use of your information,
          including your account and personal information.
        </p>
        <b>Acceptable Use of the Asterspark Platform</b>
        <p>
          In using the Asterspark Platform, you agree, and you represent and
          warrant to us and all other users of the Platform, that you:
        </p>
        <ol className="ml-12 list-decimal">
          <li className="pl-4 mb-4">
            Will not use the Asterspark Platform in a way that has any unlawful
            or fraudulent purpose or effect;
          </li>
          <li className="pl-4 mb-4">
            Will not develop software or technology that is intended to be used
            for an unlawful or fraudulent purpose;
          </li>
          <li className="pl-4 mb-4">
            Will comply with all applicable laws, rules and regulations;
          </li>
          <li className="pl-4 mb-4">
            Will not use or disclose personally identifiable information
            belonging to others except (i) with their consent; and (ii) in
            accordance with applicable privacy laws, rules and regulations;
          </li>
          <li className="pl-4 mb-4">
            Will not upload, copy, distribute, share or otherwise use or
            generate data or content that is unlawful, obscene, defamatory,
            libelous, harmful, hateful, harassing, bullying, sexual in nature,
            threatening, racially or ethnically offensive or abusive, that would
            violate a third party&apos;s rights (including their intellectual
            property rights), constitute or encourage a criminal offense or give
            rise to civil liability or damages;
          </li>
          <li className="pl-4 mb-4">
            Will not upload, transmit, disseminate, post, share, store, use any
            content, data or information, perform any services or do anything
            that infringes on, or contributes to any infringement of, any
            intellectual property rights; including copyright, trademark, patent
            or trade secret rights, whether of ours or any third party;
          </li>
          <li className="pl-4 mb-4">
            Will not disclose your password or transfer your account to any
            third party, or allow any third party to access your account;
          </li>
          <li className="pl-4 mb-4">
            Will not impersonate any person or entity;
          </li>
          <li className="pl-4 mb-4">
            Will not upload, copy, distribute, share, create or otherwise use
            content, code or information that contains or embodies software
            viruses or any other malicious computer code that is designed to
            interrupt, undermine, destroy or limit the functionality of any
            computer software, hardware or communications equipment, or that is
            designed to perform functions on any software, hardware or equipment
            without the owner&apos;s express consent;
          </li>
          <li className="pl-4 mb-4">
            Will not access the Asterspark Platform by any means other than
            through the interface provided by us for use, whether via the mobile
            apps, websites or our API, if available.
          </li>
          <li className="pl-4 mb-4">
            Except in connection with authorized and ordinary use of the
            platform, you will not use any software bot or data scraping
            techniques that accesses the Asterspark Platform (or is used in
            connection with the Asterspark Platform) to scrape or pull data for
            any purpose, whether such data was displayed publicly or not.
          </li>
          <li className="pl-4 mb-4">
            Will not collect, harvest or store any personally identifiable
            information, including user account information, from us;
          </li>
          <li className="pl-4 mb-4">
            Will not translate, reverse engineer, decompile, disassemble, modify
            or create derivative works based on the Asterspark Platform and its
            underlying software code; and
          </li>
          <li className="pl-4 mb-4">
            Will not circumvent, disable, violate or otherwise interfere with
            any security related feature of the Asterspark Platform.
          </li>
        </ol>
        <p>
          We may, but have no obligation to, remove users from the Asterspark
          Platform that we determine, in our sole discretion, to have, or which
          may reasonably appear to have, violated these Terms.
        </p>
        <b>Fees</b>
        <p>
          Our fees for using the Asterspark Platform are displayed on our
          website. By agreeing to these Terms, you agree to pay all fees
          associated with or arising from your account. Our fees are subject to
          change, however, we agree to provide you with a minimum of 30
          days&apos; notice of any such changes via email if you are an existing
          paid account holder. You may elect to cancel your account after such
          changes have been communicated to you in accordance with the
          termination provisions of this agreement. If you do not cancel your
          account, your account and payment method will be billed at the new
          rates published by us.
        </p>
        <p>
          Additional terms, including terms related to sales tax, refunds and
          payment processing may be specified on our website and/or the
          Asterspark Platform. Those terms, as amended from time to time, are
          incorporated by reference and form part of this agreement.
        </p>
        <b>Taxes</b>
        <p>
          You agree to pay any and all sales taxes, whether Canadian or foreign,
          applicable to this agreement or arising in any way from your account
          and access to and use of the Asterspark Platform.
        </p>
        <b>Payment</b>
        <p>
          We facilitate payment for your account access to the Asterspark
          Platform using Stripe, Inc., Stripe Payments Canada, Ltd. and their
          related entities worldwide (collectively “<b>Stripe</b>”).
        </p>
        <p>
          Although we may display Stripe&apos;s forms on, or in connection with,
          our website, when you provide your payment details on or in connection
          with the Asterspark Platform, you are providing them to the applicable
          payment processor. You acknowledge that our third-party payment
          processors may have their own agreements and policies which apply to
          you. While we will not have access to your entire credit card number,
          we will be able to bill your credit card and may have access to
          certain card and payment details such as the name on your card,
          billing address and card expiration date. If you have questions
          regarding our payment processor, please contact us.
        </p>
        <b>Refunds</b>
        <p>
          We do not offer refunds unless (i) we terminate your account (in which
          case we will refund any unused portion of your then currently monthly
          or annual subscription); or (ii) we have charged you in error. If you
          believe we charged you in error, you must contact us within ninety
          (90) days of such charge and we agree to refund any charges made in
          error.
        </p>
        <b>
          <u>ACCEPTANCE OF RISK AND DISCLAIMERS</u>
        </b>
        <b>
          Our Asterspark Platform is provided &quot;as is&quot; without warranty
          of any kind, including but not limited to, all implied warranties and
          conditions of merchantability and fitness for a particular purpose. We
          hereby disclaim all warranties and conditions of any kind, whether
          express, implied or statutory.
        </b>
        <b>
          Without limiting any other section of these Terms, you agree that we
          shall not be responsible for any damages you suffer arising from the
          acts or omissions, including the negligent acts or omissions, of other
          users on the Asterspark Platform, our independent contractors, payment
          processors or third-party service providers.
        </b>
        <b>
          You agree that, while we strive to have the Asterspark Platform error
          free and uninterrupted, we do not guarantee the absence of errors or
          interruptions. You agree that we shall not be held liable for any
          damage such errors or interruptions may cause. We make no
          representations and grant no warranties as to the uptime of the
          Asterspark Platform.
        </b>
        <b>
          We may also perform scheduled maintenance which will result in the
          Asterspark Platform being unavailable for certain periods of time.
        </b>
        <b>
          While users are required to comply with these Terms, including the
          acceptable use terms listed above, we make no representations and
          grant no warranties that other users, who operate independently on the
          Asterspark Platform, have in fact or will in fact, comply with all
          such terms.
        </b>
        <b>
          While other users of the Asterspark Platform provide information to us
          about themselves, we do not independently verify that information or
          take measures to confirm the identity of other users in all cases and
          as such, do not make any representation or warranty that any of the
          information provided by or about another user is true or accurate. To
          the extent you engage with other users on the platform, use caution.
        </b>
        <b>
          You agree that we shall not be obligated to and accept no liability or
          responsibility for resolving or managing disputes which may arise
          between you and any other user. If you have a dispute with another
          user, it is your responsibility to take your own legal action against
          such user.
        </b>
        <b>
          You assume all risks associated with dealing with other users whom you
          meet, or, come in contact with as a result of using the Asterspark
          Platform.
        </b>
        <b>
          <u>Limitation of our liability</u>
        </b>
        <b>
          TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL WE, OUR
          OFFICERS, DIRECTORS, SHAREHOLDERS OR EMPLOYEES, BE LIABLE TO YOU FOR
          ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, PUNITIVE, EXEMPLARY OR
          CONSEQUENTIAL DAMAGES YOU SUFFER, HOWSOEVER CAUSED, INCLUDING BY
          NEGLIGENCE OR OTHERWISE, REGARDLESS OF LEGAL THEORY AND WHETHER OR NOT
          WE HAVE BEEN WARNED OF THE POSSIBILITY OF SUCH DAMAGES AND WHETHER
          THOSE DAMAGES WERE FORESEEABLE OR NOT.
        </b>
        <b>
          IF YOU ARE DISSATISFIED WITH THE ASTERSPARK PLATFORM, OR DO NOT AGREE
          WITH ANY PART OF THESE TERMS, OR HAVE ANY OTHER DISPUTE OR CLAIM WITH
          OR AGAINST US, OUR OFFICERS, DIRECTORS, SHAREHOLDERS OR EMPLOYEES,
          THEN YOUR SOLE REMEDY IS TO CANCEL YOUR ACCOUNT SUBSCRIPTION AND
          DISCONTINUE ACCESSING AND USING THE ASTERSPARK PLATFORM.
        </b>
        <b>
          IN ADDITION TO YOUR AGREEMENT TO NOT HOLD THE ABOVE ENTITIES AND
          PERSONS LIABLE FOR ANY DAMAGES, IN THE EVENT A COURT OR ARBITRATOR OF
          COMPETENT JURISDICTION DECLINES TO UPHOLD THE ABOVE LIMITS ON
          LIABILITY, OR FINDS THEY ARE OTHERWISE NOT APPLICABLE OR ENFORCEABLE,
          YOU AGREE THAT IN NO CIRCUMSTANCES SHALL THE AGGREGATE LIABILITY FOR
          ANY AND ALL CLAIMS RELATING TO OR IN ANY WAY ARISING FROM THE USE OF
          (OR FAILURE TO BE ABLE TO USE) THE ASTERSPARK PLATFORM, OR IN ANY WAY
          RELATED TO THESE TERMS, BE MORE THAN THE AMOUNTS YOU HAVE PAID TO US
          AS A RESULT OF YOUR ACCESS TO THE PLATFORM FOR THE PREVIOUS TWO MONTHS
          IMMEDIATELY PRIOR TO YOU RAISING YOUR CLAIM WITH US IN WRITING.
        </b>
        <b>
          <u>
            YOU AGREE AND ACKNOWLEDGE THAT WE WOULD NOT ENTER INTO THIS
            AGREEMENT OR GRANT ACCESS TO THE ASTERSPARK PLATFORM WITHOUT THESE
            RESTRICTIONS AND LIMITATIONS ON OUR LIABILITY.
          </u>
        </b>
        <b>
          <u>Indemnification</u>
        </b>
        <b>
          You agree to indemnify us, our employees, shareholders, directors and
          officers, and to defend and hold each of them harmless, from any and
          all claims and liabilities (including reasonable legal fees) which may
          arise from (i) your violation of these Terms or any policy
          incorporated by reference; (ii) your violation of any third-party
          right; (iii) any breach of a representation or warranty made by you to
          us, either in these terms, privacy policy or otherwise; and (iv) any
          claim for damages suffered by another user of our service which you
          caused.
        </b>
        <b>Proprietary Rights</b>
        <p>
          The Asterspark Platform contains open source and public domain
          content, licenced content as well as proprietary content owned by us
          and by third parties. You are not permitted to copy, use or distribute
          any content (including but not limited to text, software code, images,
          trademarks, videos and audio) on the Asterspark Platform without the
          express consent of the owner.
        </p>
        <p>
          All rights, title and interest in and to the Asterspark Platform are
          and will remain the exclusive property of Asterbase Labs Ltd. and our
          licensors.
        </p>
        <p>
          The Asterspark Platform and all content thereon are protected by
          copyright, trademark and other laws of Canada, the United States and
          foreign countries. You agree not to reproduce, modify or prepare
          derivative works, distribute, sell, transfer, publicly display,
          publicly perform, transmit, or otherwise use the Asterspark Platform
          or any content thereon, without our express written consent. You also
          agree not to copy, modify or reverse engineer the software code which
          underlies the Asterspark Platform.
        </p>
        <p>
          You are not permitted to use any trademark or trade name of Asterbase
          Labs Ltd., including our logo, without our express permission.
        </p>
        <b>Your Content</b>
        <p>
          The Asterspark Platform permits you and other users the ability to
          upload, create and post content (&quot;<b>User Content</b>&quot;).
          Assuming such content is your original content, we claim no ownership
          of your User Content. While it may be displayed both privately (behind
          account access) and publicly on the Asterspark Platform (depending on
          your settings), you may delete your User Content at any time.
        </p>
        <p>
          You hereby grant us a non-exclusive, transferable, sub-licensable,
          royalty-free, worldwide license to use any of your User Content that
          you post or upload to the Asterspark Platform in order to facilitate
          the ordinary use of the Asterspark Platform. You may delete your User
          Content at any time, and thereafter, the license granted in this
          paragraph shall cease.
        </p>
        <p>
          In connection with your User Content, you affirm, represent and
          warrant that you own or have the necessary licenses, rights, consents
          and/or permissions to use and authorize us to use all patent,
          trademark, trade secret, copyright or other proprietary rights in and
          to your User Content in the manner contemplated by the Asterspark
          Platform.
        </p>
        <p>
          We do not consider proposals or ideas, including without limitation
          ideas for new products, technologies, promotions, product names,
          product feedback and product improvements you provide us (“
          <b>Feedback</b>”) to be confidential information. If you send any
          Feedback to us, you acknowledge and agree that we shall not be under
          any obligation of confidentiality with respect to the Feedback and
          nothing in these Terms limits or restricts our right to independently
          use, develop, evaluate, or market products or services, whether
          incorporating the Feedback or otherwise.
        </p>
        <b>Copyright Notice</b>
        <p>
          If you believe that your copyrighted work has been copied in a way
          that constitutes copyright infringement and is accessible on the
          Asterspark Platform, please notify us at asterbasehq@gmail.com. While
          we take no responsibility for any user who breaches your copyright or
          other intellectual property rights, we may, in our sole discretion and
          without liability, undertake to attempt to contact the infringer on
          your behalf and/or cancel the infringer&apos;s account or remove their
          User Content.
        </p>
        <b>Linked Sites</b>
        <p>
          Whether or not we are affiliated with websites or third-party vendors
          that may be linked to the Asterspark Platform, you agree that we are
          not responsible for their content. Internet links found on the
          Asterspark Platform, whether posted by us or a third party, are not an
          endorsement and we do not represent or warrant the accuracy or truth
          of the contents, or endorse the products, services or information
          found on said websites. You access those links and corresponding
          websites at your own risk.
        </p>
        <b>Law of the Contract (Governing Law) and Jurisdiction.</b>
        <p>
          These Terms, all documents incorporated by reference and your
          relationship with us shall be governed by, construed and enforced in
          accordance with the laws of the Province of Alberta, Canada, (and any
          Canadian federal laws applicable therein) as it is applied to
          agreements entered into and to be performed entirely within such
          province.
        </p>
        <p>
          You hereby agree to irrevocably and unconditionally submit to the
          exclusive jurisdiction of the courts and tribunals of Alberta, Canada
          (including the Federal courts and tribunals as applicable therein) to
          settle any disputes arising out of or in any way related to these
          Terms, all documents incorporated by reference and your relationship
          with us.
        </p>
        <b>Severability</b>
        <p>
          The invalidity or unenforceability of any provision or part of any
          provision of these Terms, including all documents and schedules
          incorporated by reference, shall not affect the validity or
          enforceability of any other provision or part of these Terms, and any
          such invalid or unenforceable provision or part thereof shall be
          deemed to be separate, severable and distinct and no provision or part
          thereof shall be deemed dependent upon any other provision or part of
          these Terms.
        </p>
        <b>No Construction Against Drafter</b>
        <p>
          If an ambiguity or question of intent arises with respect to any
          provision of these Terms, the Terms shall be construed as if drafted
          jointly by the parties and no presumption or burden of proof will
          arise favouring or disfavouring either party by virtue of authorship
          of any of the provisions of these Terms.
        </p>
        <b>Waiver of Class Proceedings and Trial By Jury</b>
        <p>
          To the extent permitted by law, you hereby waive your right to
          participate in any class action lawsuits against us, our contractors,
          employees, shareholders, successors, assigns and directors. To the
          extent permitted by law, you further waive any right to a trial by
          jury, should such a right exist, in relation to any legal dispute
          connected to or in any way arising out of these Terms.
        </p>
        <b>Incorporation by Reference</b>
        <p>
          All policies referred to in these Terms or anywhere on the Asterspark
          Platform are hereby incorporated by reference, including but not
          limited to our Privacy Policy.
        </p>
        <b>Termination</b>
        <p>
          Though we would much rather you stay, you can stop using the
          Asterspark Platform at any time. Please contact us, or follow the
          steps from within your account, to terminate your account and any paid
          subscription to the platform.
        </p>
        <p>
          Notwithstanding your decision to delete your account or no longer use
          the Asterspark Platform, you agree to pay all fees and taxes
          associated with your account, as set out in these Terms and as posted
          on our website and the Asterspark Platform.
        </p>
        <p>
          We also reserve the right to suspend your account or access to the
          Asterbase at any time, with or without reason or cause, and with or
          without notice.
        </p>
        <p>
          The cancellation, suspension or termination of access to the
          Asterspark Platform shall not terminate this agreement. In particular,
          and without limiting the generality of the foregoing, any provision
          concerning the limitation of our liability, your indemnification
          obligations, settling disputes (including the jurisdiction and choice
          of law) shall remain binding.
        </p>
        <b>Assignment of this Agreement</b>
        <p>
          These Terms shall inure to the benefit of and are binding upon the
          parties and their respective successors and permitted assigns. You
          agree that we may assign this agreement to any successor or assignee,
          whether pursuant to the purchase of the Asterspark Platform by a third
          party, the transfer of control of Asterbase Labs Ltd. or otherwise.
        </p>
        <b>Third Parties</b>
        <p>
          You agree that any provision of these Terms in which you covenant or
          which obligates you to waive rights in favour of, limit the liability
          of, hold harmless or indemnify any person or entity who is not a party
          to this agreement (such as our directors, officers, shareholders,
          employees and others), that such waivers, covenants and obligations
          are accepted by us as agent and trustee for each such third party. We
          declare ourselves as trustee of such covenants and obligations for
          each such third party; such covenants and obligations may be enforced
          by us on behalf of any such third party.
        </p>
        <b>Right to Seek Injunction</b>
        <p>
          Violation of these Terms may cause us irreparable harm and, therefore,
          you agree that we will be entitled to seek extraordinary relief
          including, but not limited to, temporary restraining orders,
          preliminary injunctions and permanent injunctions without the
          necessity of posting a bond or other security, in addition to and
          without prejudice to any other rights or remedies that we may have for
          a breach of these Terms.
        </p>
        <b>Waiver</b>
        <p>
          Our failure to enforce any right or provision of these Terms will not
          be deemed a waiver of such right or provision.
        </p>
        <b>New Features</b>
        <p>
          Any new features that augment or enhance the current Asterspark
          Platform, including the release of new versions, new products or
          services, tools and resources, shall be subject to these Terms.
        </p>
        <b>Entire Agreement</b>
        <p>
          This is the entire agreement between the parties relating to the
          matters contained herein and shall not be modified except (i) by
          publication of a subsequent version of these Terms by us on; or (ii)
          in writing, in an addendum or other agreement, signed by a duly
          authorized representative of Asterbase Labs Ltd.
        </p>
      </div>
      <Footer />
    </main>
  );
}

export default TermsOfService;
