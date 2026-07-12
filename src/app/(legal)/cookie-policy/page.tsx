import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export const metadata = { title: "Cookie Policy | Hammet" };

const content = `
**This Cookie Notice explains how Hammet uses cookies on our website at [hammet.hammetlabs.com](https://hammet.hammetlabs.com), our progressive web application and online service (collectively, our “Service”), and your related choices. Please refer to our Privacy Policy for more information on our privacy practices.**

**What Is a Cookie?**

A cookie is a small piece of data that a website or web application places on your device when you visit or use it. Cookies help platforms remember who you are, keep you logged in and understand how the platform is being used so it can be improved.

Some cookies are essential. Without them, the platform cannot function. Others are optional and can be declined.

**Who This Policy Applies To**

This Cookie Policy applies to all users of the Hammet platform, including students, teachers, school administrators and parents who access the platform at any HammetLabs or Hammet web address. It applies to both the web application and any browser-based version of the platform.

This policy is part of our broader Privacy Policy, which you can read at [hammet.hammetlabs.com/privacy-policy](https://hammet.hammetlabs.com/privacy-policy)

**What Cookies We Use and Why**

Hammet uses a small and specific set of cookies. We do not use advertising cookies, behavioural tracking cookies or third-party marketing cookies of any kind.

## 1. Authentication Cookie (Essential)

When you log in to the Hammet platform, we generate a session cookie tied to your User ID and Device ID. This cookie does one thing: it tells the platform that you are the person who logged in, so you do not have to re-enter your credentials every time you navigate between pages or resume a lesson.

This cookie contains your User ID and Device ID in an encrypted format. It does not contain your name, age, school or any other personal detail in readable form.

This cookie expires when you log out or when your session ends. It is not used for any purpose other than keeping you authenticated during your active session.

This cookie is essential to the platform. The platform cannot function without it. It cannot be declined.


## 2. Preference Cookie (Functional)

If you have set any platform preferences, such as low-bandwidth mode or display settings, a preference cookie stores those settings on your device so they are applied each time you return. This cookie does not contain personal data. It contains only your chosen settings in a simple key-value format.

This cookie can be cleared by resetting your preferences in your account settings.

## What We Do Not Use

We want to be direct about this. Hammet does not use:

- Advertising cookies of any kind. We do not run ads and we do not allow advertisers on our platform.

- Third-party tracking cookies. We do not allow third-party companies to place cookies on your device through our platform.

- Analytics cookies that identify individual users. Any platform analytics we collect are aggregated and anonymised and do not involve user-identifying cookies.

- Cross-site tracking. We do not track your behaviour across other websites or apps.

## How We Identify Devices

When you first access Hammet on a device, the platform generates a Device ID for that device. This Device ID is used in combination with your User ID to create your authentication cookie. The Device ID helps the platform distinguish between different devices used by the same account, which is particularly relevant for schools where students may access the platform from a shared computer lab.

The Device ID does not reveal the make, model, or location of your device. It is a randomly generated identifier tied to your browser session on that device.

## Third-Party Cookies

Hammet does not place third-party cookies on your device.

However, if a lesson includes an embedded YouTube video, YouTube may place its own cookies on your device when the video is played. These cookies are governed by Google’s Privacy Policy and YouTube’s Terms of Service, not by this policy. Where possible, Hammet embeds videos in privacy-enhanced mode to limit the data YouTube collects before you play a video.

## How Long Cookies Last

- **Authentication cookie:** Expires at the end of your active session or when you log out, whichever comes first.

- **Session state cookie:** Expires at the end of your active session.

- **Preference cookie:** Persists until you clear it through your account settings or clear your browser’s cookies manually. Maximum duration: 12 months.

## How to Manage or Delete Cookies
You can view and adjust your cookie preferences in our cookie preference center. You can choose to accept or decline all cookies or specific types of cookies, other than strictly necessary cookies. The cookie manager will block or disable cookies once your preference has been set, but will not result in removal of cookies placed prior to your election.
You also may be able to refuse or disable cookies by adjusting your web browser settings. Some browsers have options that allow the visitor to control whether the browser will accept cookies, reject cookies, or notify the visitor each time a cookie is sent. Because each web browser is different, please consult the instructions provided by your web browser (typically in the “help” section).
The following links explain how to do this in the most commonly used browsers:

Google Chrome: [support.google.com/chrome/answer/95647](https://support.google.com/chrome/answer/95647) 

Mozilla Firefox: [support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox](https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox)

Safari: [support.apple.com/en-gb/guide/safari/sfri11471/mac ](https://support.apple.com/en-gb/guide/safari/sfri11471/mac )

Microsoft Edge: [support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge](https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge)

Please note that deleting or blocking our essential cookies will prevent you from logging in to the platform and using core features. We recommend that students and school administrators do not block essential cookies on devices used to access Hammet.


## A Note on Students

Hammet is designed for secondary school students aged approximately 9 to 18. We apply extra care to how cookies interact with student accounts. Student authentication cookies are generated by the platform at login and are not shared with any third party. Schools that manage student devices may wish to review their device management settings to ensure cookies function correctly on school-owned hardware.

Parents or guardians with questions about cookies and student data should contact their school in the first instance, as schools act as the data controller for enrolled students.

## Changes to This Policy

We may update this Cookie Policy from time to time as the platform evolves or as legal requirements change. Material changes will be communicated to schools and registered users before they take effect. The “Last Updated” date at the top of this page will always reflect the most recent version.

## Contact

If you have questions about this Cookie Policy or how we use cookies on the Hammet platform, please contact us:

**Hammet Ltd**  
**Email:** [admin@hammetlabs.com](mailto:admin@hammetlabs.com)  
**Website:** [hammet.hammetlabs.com](https://hammet.hammetlabs.com)`; 

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="2nd April 2026" content={content} />
  );
}