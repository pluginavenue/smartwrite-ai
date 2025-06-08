<?php
if (!defined('ABSPATH')) exit;

// Register AJAX handler (legacy fallback, if needed)
add_action('wp_ajax_smartwrite_ai_generate', 'smartwrite_ai_handle_generate');

function smartwrite_ai_handle_generate() {
    check_ajax_referer('smartwrite_ai_nonce', 'nonce');

    $prompt = isset($_POST['prompt']) ? sanitize_text_field($_POST['prompt']) : '';
    if (empty($prompt)) {
        wp_send_json_error('Prompt is missing.');
    }

    $api_key = get_option('smartwrite_api_key');
    if (!$api_key) {
        wp_send_json_error('API key not set.');
    }

    $response = smartwrite_ai_call_openai($prompt, $api_key);

    if (is_wp_error($response)) {
        wp_send_json_error($response->get_error_message());
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    error_log('OpenAI response: ' . print_r($body, true));

    if (
        isset($body['choices']) &&
        is_array($body['choices']) &&
        isset($body['choices'][0]['message']['content'])
    ) {
        $ai_output = trim($body['choices'][0]['message']['content']);
        wp_send_json_success($ai_output);
    }

    if (
        isset($body['choices']) &&
        is_array($body['choices']) &&
        isset($body['choices'][0]['text'])
    ) {
        $ai_output = trim($body['choices'][0]['text']);
        wp_send_json_success($ai_output);
    }

    error_log('SmartWrite AI: Failed to parse valid content.');
    wp_send_json_error('Invalid response format from API.');
}

// OpenAI API call function
function smartwrite_ai_call_openai($prompt, $api_key) {
    $endpoint = 'https://api.openai.com/v1/chat/completions';
    $model = get_option('smartwrite_model', 'gpt-3.5-turbo');

    $args = [
        'headers' => [
            'Authorization' => 'Bearer ' . $api_key,
            'Content-Type'  => 'application/json',
        ],
        'body' => json_encode([
            'model' => $model,
            'messages' => [
                ['role' => 'system', 'content' => 'You are a helpful assistant that writes clear, professional content for WordPress.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'max_tokens' => 300,
            'temperature' => 0.7,
        ]),
        'timeout' => 20,
    ];

    return wp_remote_post($endpoint, $args);
}

// Register REST endpoint
add_action('rest_api_init', function () {
    register_rest_route('smartwrite/v1', '/generate', [
        'methods' => 'POST',
        'callback' => 'smartwrite_rest_generate_content',
       'permission_callback' => function () {
            return current_user_can('edit_posts');
        },
    ]);
});

// REST handler
function smartwrite_rest_generate_content(WP_REST_Request $request) {
    $prompt = sanitize_text_field($request->get_param('prompt'));
    $api_key = get_option('smartwrite_api_key');
    $model = get_option('smartwrite_model', 'gpt-3.5-turbo');

    if (!$prompt || !$api_key) {
        return rest_ensure_response([
            'success' => false,
            'data' => 'Missing prompt or API key.',
        ]);
    }

    $response = smartwrite_ai_call_openai($prompt, $api_key);
    if (is_wp_error($response)) {
        return rest_ensure_response([
            'success' => false,
            'data' => $response->get_error_message(),
        ]);
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);

    if (
        isset($body['choices']) &&
        is_array($body['choices']) &&
        isset($body['choices'][0]['message']['content'])
    ) {
        return rest_ensure_response([
            'success' => true,
            'data' => trim($body['choices'][0]['message']['content']),
        ]);
    }

    if (
        isset($body['choices']) &&
        is_array($body['choices']) &&
        isset($body['choices'][0]['text'])
    ) {
        return rest_ensure_response([
            'success' => true,
            'data' => trim($body['choices'][0]['text']),
        ]);
    }

    error_log('SmartWrite REST API error: ' . print_r($body, true));
    return rest_ensure_response([
        'success' => false,
        'data' => 'Invalid response format from API.',
    ]);
}
