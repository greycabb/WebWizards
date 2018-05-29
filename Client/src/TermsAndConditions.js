import React from 'react';
import { Link, hashHistory } from 'react-router';
import Nav from './Nav';

export default class TermsAndConditionsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    componentWillMount() {

    }

    componentDidMount() {
        document.title = 'Web Wizards - Terms and Conditions';
    }

    render() {

        return (
            <div>
                <Nav login={false} />
                <div className="terms-and-conditions-page">
                    <h1>Web Wizards Terms and Conditions</h1>

                    <div>
                        <h2>1. User Agreement</h2>
                        <p>These terms of use constitute an agreement between you and the Web Wizards team that governs your use of the webwizards.me. Please read this contract carefully. By using Web Wizards, you acknowledge that you have read, understood, and accepted these terms and conditions. If you do not agree with any of the conditions outlined here, please do not use Web Wizards. The terms and conditions are subject to change. This page will display all updates and your continued use of Web Wizards constitutes your acceptance of any changes to the terms of use.</p>
                    </div>
                    <div>
                        <h2>2. Privacy Policy</h2>
                        <p>Your privacy is important to us. Do not post or share sensitive information on the Web Wizards website. Please read our privacy policy, which describes how information is collected, stored, and used through Web Wizards. By using Web Wizards, you agree with the terms set forth in the Web Wizards privacy policy.</p>
                    </div>
                    <div>
                        <h2>3. Account Maintenance</h2>
                        <p>In order to use all features of Web Wizards, you will need to create an account. You are responsible for keeping your password secure from others. You are responsible for any use of your account, including when other people are using your account. If any use of your account violates the terms of use, your account may be suspended or deleted. Do not use another user’s Web Wizards account without permission.</p>
                    </div>
                    <div>
                        <h2>4. Rules of Usage</h2>
                        <p>Web Wizards supports personalized designs when building websites. Because Web Wizards is visible to a wide audience, some content is inappropriate. You may not:
                            <ol>
                                <li>Promote discrimination, bigotry, or hatred towards any individual or group</li>
                                <li>Threaten or harass any other person</li>
                                <li>Use foul language or personal attacks</li>
                                <li>Use sexually explicit or graphically violent material</li>
                                <li>Commit illegal activities or provide instructions on how to do so</li>
                                <li>Ask any other user for personally identifying information</li>
                                <li>Expose any other person’s personally identifying information</li>
                                <li>Use Web Wizards to disrupt the service or gain unauthorized access to the service</li>
                                <li>Post links to content outside of the Web Wizards website</li>
                            </ol>
                        </p>
                    </div>
                    <div>
                        <h2>5. User-Generated Content</h2>
                        <p>The Web Wizards team encourages users to be creative by posting and sharing code, art, music, and other works. You are responsible for making sure you have the necessary rights, licenses, or permissions for any user-generated content you submit to Web Wizards. The Web Wizards team reserves the right to monitor all uses of the Web Wizards services. The Web Wizards team may edit or delete content that violates the terms of use without notice.</p>
                    </div>
                    <div>
                        <h2>6. Web Wizards Content and Licensing</h2>
                        <p>Except for any user-generated content, the Web Wizards team owns all rights to the Web Wizards code, design, and functionality, and any software provided through Web Wizards. Contact the Web Wizards team if you intend to use Web Wizards in a way that is not permitted in these terms of use.</p>
                    </div>
                    <div>
                        <h2>7. Suspension and Termination of Accounts</h2>
                        <p>Web Wizards reserves the right to suspend your account for any violation of the terms of use. Repeat violators may have their account deleted. The Web Wizards team will decide what constitutes a violation of the terms of use.</p>
                    </div>
                    <div>
                        <h2>8. Third Party Websites</h2>
                        <p>Content on Web Wizards, including user-generated content, may include links to third party websites. The Web Wizards Team assumes no responsibility for the privacy practices, content, or functionality of third party websites. You agree to take responsibility for any and all liability arising from third party websites that you post.</p>
                    </div>
                    <div>
                        <h2>9. Limitation of Liability</h2>
                        <p>The Web Wizards entities shall not be liable to you or any third parties for any direct, indirect, special, consequential or punitive damages of any kind, regardless of the type of claim or the nature of the cause of action, even if the Web Wizards Team has been advised of the possibility of such damages. The Web Wizards entities shall have no liability to you or any third parties for damages or harms arising out of user-generated content.</p>
                    </div>
                    <div>
                        <h2>10. Entire Agreement</h2>
                        <p>This document, along with all appendices, constitutes the entire terms of use. Please do not use Web Wizards if you do not agree or comply with any of the terms set forth on this page. If you have any questions, please contact the Web Wizards Team. Revision date: 29 May 2018.</p>
                        <br />
                    </div>
                </div>
            </div>
        );
    }
}