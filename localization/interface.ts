interface LocStrings {
    [index: string]: string

    test: string;
    lang_changed: string;
    invalid_lang: string;
    prefix_changed: string;
    roles_set: string;
    invalid_roles: string;
    chan_added: string;
    chan_created: string;
    invalid_chan: string;
    paramBoolSet: string;

    error_no_args_command: string;
    error_text_channel_not_found: string;
    error_vocal_channel_not_found: string;
    error_chan_general: string;
    error_vocal_channel_rights: string;

    initWelcome: string;
    langPrompt: string;
    prefixPrompt: string;
    adminRolePrompt: string;
    modRolePrompt: string;
    vocChanPrompt: string;
    botChanPrompt: string;
    rateSpeakerPrompt: string;
    topSpeakerPrompt: string;
    endedInit: string;
    deletingTable: string;
    helpPrompt: string,
    help_title: string,
    help_admin_commands_title: string;
    configure_help: string;

    command_admin_reserved: string;
    command_not_found: string;

    command_create_poll: string;
    command_add_poll_choice: string;
    command_del_poll_choice: string;
    command_set_lang: string;
    command_set_prefix: string;
    command_set_admin_roles: string;
    command_set_mod_roles: string;
    command_set_voc_chan: string;
    command_set_bot_chan: string;
    command_configure: string;
    command_help : string,

    debate_title: string;
    debate_subtitle_speaking_time: string;
    waitlist_title: string;
    airing_title: string;
    airing_subtitle: string;
    waiting_subtitle: string;
    waitlist_footer: string;

    waitlist_nobody_speaking_title: string;
    waitlist_nobody_speaking_subtitle: string;

    waitlist_nobody_waiting_title: string;
    waitlist_nobody_waiting_subtitle: string;

    waitlist_bottom_help_title: string
    waitlist_bottom_help_subtitle: string
}
