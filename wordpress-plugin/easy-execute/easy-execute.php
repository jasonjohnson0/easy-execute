<?php
/**
 * Plugin Name:       Easy Execute Deals
 * Plugin URI:        https://github.com/jasonjohnson0/easy-execute
 * Description:       Embed live Easy Execute deals, sponsored offers, and referral signup on any page or post with the [easy_execute] shortcode.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       easy-execute
 *
 * @package EasyExecute
 */

defined( 'ABSPATH' ) || exit;

define( 'EASY_EXECUTE_VERSION', '1.0.0' );
define( 'EASY_EXECUTE_DEFAULT_APP_URL', 'https://easyexecute.com' );

/**
 * Base URL of the Easy Execute app that serves embed.js.
 *
 * Resolution order: the EASY_EXECUTE_APP_URL constant (define it in wp-config.php
 * to lock the value down), then the saved setting, then the built-in default.
 */
function easy_execute_app_url() {
	if ( defined( 'EASY_EXECUTE_APP_URL' ) && EASY_EXECUTE_APP_URL ) {
		$url = EASY_EXECUTE_APP_URL;
	} else {
		$url = get_option( 'easy_execute_app_url', EASY_EXECUTE_DEFAULT_APP_URL );
	}

	$url = esc_url_raw( trim( (string) $url ) );

	return untrailingslashit( $url ? $url : EASY_EXECUTE_DEFAULT_APP_URL );
}

/**
 * Register the embed script. It is only enqueued when a shortcode renders,
 * so pages without an embed stay untouched.
 */
function easy_execute_register_assets() {
	wp_register_script(
		'easy-execute-embed',
		easy_execute_app_url() . '/embed.js',
		array(),
		EASY_EXECUTE_VERSION,
		true
	);
}
add_action( 'wp_enqueue_scripts', 'easy_execute_register_assets' );

/**
 * [easy_execute] shortcode.
 *
 * Attributes:
 *   mode        deals | business | sponsored | signup   (default: deals)
 *   business_id UUID, required for mode="business"
 *   category    filter deals by business category
 *   limit       max rows; server caps at 50 (deals) / 25 (sponsored)
 *   theme       auto | light | dark                     (default: auto)
 *   ref         referral code appended to every outbound link
 *   heading     signup mode headline
 *   subheading  signup mode supporting line
 *   cta         signup mode button label
 *
 * @param array $atts Shortcode attributes.
 * @return string Container markup.
 */
function easy_execute_shortcode( $atts ) {
	$atts = shortcode_atts(
		array(
			'mode'        => 'deals',
			'business_id' => '',
			'category'    => '',
			'limit'       => '',
			'theme'       => 'auto',
			'ref'         => '',
			'heading'     => '',
			'subheading'  => '',
			'cta'         => '',
		),
		$atts,
		'easy_execute'
	);

	$allowed_modes = array( 'deals', 'business', 'sponsored', 'signup' );
	$mode          = in_array( $atts['mode'], $allowed_modes, true ) ? $atts['mode'] : 'deals';

	$allowed_themes = array( 'auto', 'light', 'dark' );
	$theme          = in_array( $atts['theme'], $allowed_themes, true ) ? $atts['theme'] : 'auto';

	// Only pass a business id through if it really is a UUID, so a typo cannot be
	// smuggled into the request as arbitrary text.
	$business_id = '';
	if ( $atts['business_id'] && preg_match( '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $atts['business_id'] ) ) {
		$business_id = strtolower( $atts['business_id'] );
	}

	if ( 'business' === $mode && ! $business_id ) {
		if ( current_user_can( 'edit_posts' ) ) {
			return '<p>' . esc_html__( 'Easy Execute: mode="business" needs a valid business_id.', 'easy-execute' ) . '</p>';
		}
		return '';
	}

	$limit = absint( $atts['limit'] );

	wp_enqueue_script( 'easy-execute-embed' );

	$attributes = array(
		'data-ee-embed'   => '',
		'data-ee-mode'    => $mode,
		'data-ee-theme'   => $theme,
		'data-ee-app-url' => easy_execute_app_url(),
	);

	if ( $business_id ) {
		$attributes['data-ee-business-id'] = $business_id;
	}
	if ( $atts['category'] ) {
		$attributes['data-ee-category'] = $atts['category'];
	}
	if ( $limit ) {
		$attributes['data-ee-limit'] = (string) $limit;
	}
	if ( $atts['ref'] ) {
		$attributes['data-ee-ref'] = $atts['ref'];
	}
	if ( 'signup' === $mode ) {
		if ( $atts['heading'] ) {
			$attributes['data-ee-heading'] = $atts['heading'];
		}
		if ( $atts['subheading'] ) {
			$attributes['data-ee-subheading'] = $atts['subheading'];
		}
		if ( $atts['cta'] ) {
			$attributes['data-ee-cta'] = $atts['cta'];
		}
	}

	$rendered = '';
	foreach ( $attributes as $name => $value ) {
		$rendered .= '' === $value
			? ' ' . esc_attr( $name )
			: ' ' . esc_attr( $name ) . '="' . esc_attr( $value ) . '"';
	}

	return '<div class="easy-execute-embed"' . $rendered . '></div>';
}
add_shortcode( 'easy_execute', 'easy_execute_shortcode' );

/* -------------------------------------------------------------- settings -- */

/**
 * Add the settings page under Settings.
 */
function easy_execute_settings_menu() {
	add_options_page(
		__( 'Easy Execute', 'easy-execute' ),
		__( 'Easy Execute', 'easy-execute' ),
		'manage_options',
		'easy-execute',
		'easy_execute_settings_page'
	);
}
add_action( 'admin_menu', 'easy_execute_settings_menu' );

/**
 * Register the single app URL setting.
 */
function easy_execute_register_settings() {
	register_setting(
		'easy_execute',
		'easy_execute_app_url',
		array(
			'type'              => 'string',
			'sanitize_callback' => 'esc_url_raw',
			'default'           => EASY_EXECUTE_DEFAULT_APP_URL,
		)
	);
}
add_action( 'admin_init', 'easy_execute_register_settings' );

/**
 * Render the settings page.
 */
function easy_execute_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$locked = defined( 'EASY_EXECUTE_APP_URL' ) && EASY_EXECUTE_APP_URL;
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Easy Execute', 'easy-execute' ); ?></h1>
		<form action="options.php" method="post">
			<?php settings_fields( 'easy_execute' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row">
						<label for="easy_execute_app_url"><?php esc_html_e( 'App URL', 'easy-execute' ); ?></label>
					</th>
					<td>
						<input
							name="easy_execute_app_url"
							id="easy_execute_app_url"
							type="url"
							class="regular-text"
							value="<?php echo esc_attr( get_option( 'easy_execute_app_url', EASY_EXECUTE_DEFAULT_APP_URL ) ); ?>"
							<?php disabled( $locked ); ?>
						/>
						<p class="description">
							<?php
							echo $locked
								? esc_html__( 'Locked by the EASY_EXECUTE_APP_URL constant in wp-config.php.', 'easy-execute' )
								: esc_html__( 'Where your Easy Execute app is hosted. The embed script is loaded from this origin.', 'easy-execute' );
							?>
						</p>
					</td>
				</tr>
			</table>
			<?php submit_button(); ?>
		</form>

		<h2><?php esc_html_e( 'Shortcodes', 'easy-execute' ); ?></h2>
		<p><?php esc_html_e( 'Paste any of these into a page, post, or Custom HTML block:', 'easy-execute' ); ?></p>
		<ul>
			<li><code>[easy_execute]</code> &mdash; <?php esc_html_e( 'all active deals', 'easy-execute' ); ?></li>
			<li><code>[easy_execute limit="6" category="Restaurants"]</code></li>
			<li><code>[easy_execute mode="business" business_id="YOUR-BUSINESS-UUID"]</code></li>
			<li><code>[easy_execute mode="sponsored" limit="3"]</code></li>
			<li><code>[easy_execute mode="signup" ref="YOUR-REFERRAL-CODE"]</code></li>
		</ul>
	</div>
	<?php
}
