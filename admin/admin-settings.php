<?php
if (!defined('ABSPATH')) exit;

// Register settings
add_action('admin_init', function () {
    register_setting('smartwrite_settings_group', 'smartwrite_api_key');
});

// Add settings page to Settings menu
add_action('admin_menu', function () {
    add_options_page(
        'SmartWrite AI Settings',
        'SmartWrite AI',
        'manage_options',
        'smartwrite-ai',
        'smartwrite_render_settings_page'
    );
});

// Render settings page
function smartwrite_render_settings_page() {
    ?>
    <div class="wrap">
        <h1>SmartWrite AI Settings</h1>
        <form method="post" action="options.php">
            <?php settings_fields('smartwrite_settings_group'); ?>
            <?php do_settings_sections('smartwrite_settings_group'); ?>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">OpenAI API Key</th>
                    <td>
                        <input type="text" name="smartwrite_api_key" value="<?php echo esc_attr(get_option('smartwrite_api_key')); ?>" style="width: 400px;" />
                        <p class="description">Enter your OpenAI API key here to enable SmartWrite AI features.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}