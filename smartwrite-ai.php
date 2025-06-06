<?php
/**
 * Plugin Name: SmartWrite AI
 * Description: An AI-powered content assistant that helps you write intros, summaries, meta descriptions, and more — right inside your WordPress editor.
 * Plugin URI: https://pluginavenue.com/plugins/smartwrite-ai
 * Author: Plugin Avenue, Stephen Moore
 * Author URI: https://pluginavenue.com
 * Version: 1.0.0
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: smartwrite-ai
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('SMARTWRITE_AI_VERSION', '1.0.0');
define('SMARTWRITE_AI_PATH', plugin_dir_path(__FILE__));
define('SMARTWRITE_AI_URL', plugin_dir_url(__FILE__));

// Load plugin files
require_once SMARTWRITE_AI_PATH . 'includes/enqueue-assets.php';
require_once SMARTWRITE_AI_PATH . 'includes/admin-settings.php';
require_once SMARTWRITE_AI_PATH . 'includes/ai-functions.php';
require_once SMARTWRITE_AI_PATH . 'includes/classic-editor.php';

// Add settings link on plugin page
add_filter('plugin_action_links_' . plugin_basename(__FILE__), function($links) {
    $settings_link = '<a href="' . admin_url('options-general.php?page=smartwrite_ai') . '">Settings</a>';
    array_unshift($links, $settings_link);
    return $links;
});

// Plugin initialization
add_action('plugins_loaded', function() {
    load_plugin_textdomain('smartwrite-ai', false, dirname(plugin_basename(__FILE__)) . '/languages/');
});
