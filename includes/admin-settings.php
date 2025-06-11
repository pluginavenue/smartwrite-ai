<?php
if (!defined('ABSPATH')) exit;

// Register settings
add_action('admin_init', function () {
    register_setting('smartwrite_settings_group', 'smartwrite_api_key');
    register_setting('smartwrite_settings_group', 'smartwrite_model');
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
    $selected_model = get_option('smartwrite_model', 'gpt-3.5-turbo');
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
                        <p class="description">Enter your OpenAI API key to enable SmartWrite AI features.</p>
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row">Model</th>
                    <td>
                        <select name="smartwrite_model">
                            <option value="gpt-3.5-turbo" <?php selected($selected_model, 'gpt-3.5-turbo'); ?>>GPT-3.5 Turbo</option>
                            <option value="gpt-4" <?php selected($selected_model, 'gpt-4'); ?>>GPT-4</option>
                        </select>
                        <p class="description">GPT-4 provides better output but is more expensive and slower.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>

       <?php if ( ! defined( 'SMARTWRITE_PRO_VERSION' ) ) : ?>
            <div class="smartwrite-pro-cta">
                <h2><span class="emoji">💡</span> Upgrade to SmartWrite Pro</h2>
                <ul>
                <li>✍️ Write with tone, length, and detail controls</li>
                <li>🧭 Create outlines, intros, conclusions & more</li>
                <li>📊 Optimize for SEO with meta tools</li>
                <li>🚀 Use GPT-4 with smarter prompt shaping</li>
                <li>📂 Get commercial license and priority access</li>
                </ul>
                <a href="https://pluginavenue.com/checkout/smartwrite-pro" target="_blank" class="smartwrite-pro-btn">
                Learn More →
                </a>
            </div>
        <?php endif; ?>

        <hr style="margin: 40px 0;">
        
        <div class="smartwrite-help">
            <h2>📘 Help & Documentation</h2>
            <p>Need help using SmartWrite AI? Explore these resources:</p>
            <ul>
                <li>🧠 <a href="https://pluginavenue.com/docs/smartwrite-ai/" target="_blank">Using SmartWrite AI</a></li>
                <li>🔑 <a href="https://platform.openai.com/account/api-keys" target="_blank">How to get your OpenAI API key</a></li>
                <li>❓ <a href="https://wordpress.org/plugins/smartwrite-ai/#faq" target="_blank">Frequently Asked Questions</a></li>
                <li>💬 <a href="mailto:support@pluginavenue.com">Contact Plugin Avenue Support</a></li>
            </ul>
        </div>
    </div>
    <?php
}
