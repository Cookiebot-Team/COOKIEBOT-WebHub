'use client';

import { useTranslations } from "next-intl"; 

export default function Privacy() {
    //const t = useTranslations("Privacy")

    return (
        <main className="min-h-screen py-8">
            <div className="text-left bg-neutral-100 bg-opacity-40 text-slate-700 max-w-3xl mx-auto px-4 mt-12 mb-10 shadow-lg rounded-md">
                <p className="h-6"></p>
                <h1 className="mb-10 font-mono text-center">Privacy Statement for Cookiebot</h1>

                <p className="text-center">Cookiebot is a Telegram bot designed to manage and enhance group interactions. This privacy statement outlines the types of information Cookiebot collects, how it is stored, and the purposes for which it is used.</p>
                <p className="mt-2 mb-2 text-center font-thin"><i>By using Cookiebot, you agree to the terms of this privacy statement.</i></p>

                <p className="text-center font-bold text-xl">Information Collection and Use</p>

                <p><b>1. Group and User Identification</b></p>
                <ul>
                    <li>• Cookiebot stores the IDs, titles and profile photos of groups it is a member of to facilitate its functionalities within these groups.</li>
                    <li>• The bot stores usernames of users within groups as they send messages, enabling it to tag users within these chats.</li>
                </ul>

                <p><b>2. Media and Stickers</b></p>
                <ul>
                    <li>• Sticker IDs and media IDs can be stored by the bot, but this data is never processed beyond storage.</li>
                </ul>

                <p><b>3. Configuration and Rules</b></p>
                <ul>
                    <li>• Welcome messages, rules messages, and configurations are only stored when a user explicitly sends them to the bot for setup purposes.</li>
                </ul>

                <p><b>4. Fake Account Reporting</b></p>
                <ul>
                    <li>• The bot stores the IDs of users reported as fake accounts by others to protect groups from spam and malicious accounts.</li>
                </ul>

                <p className="text-center font-bold text-xl">Data Storage and Security</p>
                <ul>
                    <li>• All stored data (except for group profile photos) is kept in a secure database accessible only via encrypted SSH connections.</li>
                    <li>• Group profile photos are stored in a public Google Cloud Storage bucket and are accessible via signed URLs. These URLs however are NOT linked to any information of the group or its admins.</li>
                    <li>• Message contexts are temporarily stored in RAM but are NOT saved to the database. This data is volatile and quickly exchanged, ensuring it is not retained for long-term use.</li>
                    <li>• Cookiebot does NOT store any message content, personal information or personal profile photos.</li>
                    <li>• Error messages are sent directly to the bot creator for debugging purposes but are NOT stored.</li>
                </ul>

                <p className="text-center font-bold text-xl">User Interactions</p>
                <ul>
                    <li>• Messages sent privately to the bot are never stored.</li>
                    <li>• In group chats, only the username and group ID are stored from group messages. For sticker messages, the sticker ID is stored; otherwise, no other data is stored.</li>
                    <li>• When interacting directly with the bot to change rules, welcome messages, or configurations, the context of these messages is volatile and NOT stored in the database.</li>
                    <li>• Messages that do not involve the bot will NOT result in any data storage other than what is specified above.</li>
                </ul>

                <p className="text-center font-bold text-xl"><b>Open Source Code</b></p>
                <p>Cookiebot's code is open source and available in the following repositories:</p>
                <ul>
                    <li className="text-zinc-600 hover:text-yellow-500 font-bold mr-4"><a href="https://github.com/MekhyW/COOKIEBOT-Telegram-Group-Bot">Cookiebot Telegram Group Bot</a></li>
                    <li className="text-zinc-600 hover:text-yellow-500 font-bold mr-4"><a href="https://github.com/MekhyW/COOKIEBOT-backend">Cookiebot Backend</a></li>
                    <li className="text-zinc-600 hover:text-yellow-500 font-bold mr-4"><a href="https://github.com/MekhyW/COOKIEBOT-WebHub">Cookiebot WebHub</a></li>
                </ul>

                <p className="text-center font-bold text-xl"><b>Contact</b></p>
                <p className="font-thin ml-2 mb-2 mr-2">If you have any questions or concerns about this privacy statement, please contact me, @mekhyw.</p>

                <blockquote className="border-l-2 border-l-orange-700 bg-slate-200 bg-opacity-50 font-thin ml-2 mr-2 min-h-20 text-center flex items-center">Thank you for using Cookiebot. Your privacy is important to me, and I am committed to protecting your data while helping your group chat experience.</blockquote>
                <p className="h-10"></p>
            </div>
        </main>
    )
}