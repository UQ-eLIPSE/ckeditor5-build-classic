import Model from '@ckeditor/ckeditor5-ui/src/model';
import {
	toWidget,
	viewToModelPositionOutsideModelElement
} from '@ckeditor/ckeditor5-widget/src/utils';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import {
	createDropdown,
	addListToDropdown
} from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import placeholderIcon from './placeholder.svg';

export default function PlaceholderPlugin( editor ) {
	// Register placeholder as inline widget
	editor.model.schema.register( 'placeholder', {
		allowWhere: '$text',
		isObject: true,
		isInline: true,
		allowAttributes: [ 'type' ]
	} );

	// Converter to put placeholder in editor view if it is in model
	editor.conversion.for( 'editingDowncast' ).elementToElement( {
		model: 'placeholder',
		view: ( modelItem, viewWriter ) => {
			const widgetElement = createPlaceholderView( modelItem, viewWriter );
			return toWidget( widgetElement, viewWriter );
		}
	} );

	// Converter for data downcast (model to view)
	editor.conversion.for( 'dataDowncast' ).elementToElement( {
		model: 'placeholder',
		view: createPlaceholderView
	} );

	// Converter to put placeholder in model if it is in editor view
	editor.conversion.for( 'upcast' ).elementToElement( {
		view: 'placeholder',
		model: ( viewElement, modelWriter ) => {
			let type = 'general';
			if ( viewElement.childCount ) {
				const text = viewElement.getChild( 0 );

				if ( text.is( 'text' ) ) {
					type = text.data.slice( 1, -1 );
				}
			}
			return modelWriter.createElement( 'placeholder', { type } );
		}
	} );

	// Map view positions to correct model positions when using a widget
	editor.editing.mapper.on(
		'viewToModelPosition',
		viewToModelPositionOutsideModelElement(
			editor.model,
			viewElement => viewElement.name == 'placeholder'
		)
	);

	// Register UI component i.e. button for toolbar
	editor.ui.componentFactory.add( 'placeholder', locale => {
		const dropdownView = createDropdown( locale );

		// Create dropdown button for toolbar
		dropdownView.buttonView.set( {
			label: 'Insert placeholder',
			icon: placeholderIcon,
			tooltip: true
		} );

		// Create a dropdown with a list of text variables you can add inside the panel
		const items = new Collection();

		items.add(
			{
				type: 'button',
				model: new Model( {
					withText: true,
					label: 'InstructorName'
				} )
			},
			0
		);

		items.add(
			{
				type: 'button',
				model: new Model( {
					withText: true,
					label: 'StudentName'
				} )
			},
			1
		);

		items.add(
			{
				type: 'button',
				model: new Model( {
					withText: true,
					label: 'CourseTitle'
				} )
			},
			2
		);

		items.add(
			{
				type: 'button',
				model: new Model( {
					withText: true,
					label: 'CourseCode'
				} )
			},
			3
		);

		addListToDropdown( dropdownView, items );

		// When each dropdown item is clicked, insert placeholder to model with specific text
		dropdownView.listView.items.get( 0 ).on( 'execute', () => {
			insertPlaceholder( editor, 'InstructorName' );
		} );

		dropdownView.listView.items.get( 1 ).on( 'execute', () => {
			insertPlaceholder( editor, 'StudentName' );
		} );

		dropdownView.listView.items.get( 2 ).on( 'execute', () => {
			insertPlaceholder( editor, 'CourseTitle' );
		} );

		dropdownView.listView.items.get( 3 ).on( 'execute', () => {
			insertPlaceholder( editor, 'CourseCode' );
		} );

		return dropdownView;
	} );
}

// Inserts a placeholder element into the model with type property equal to the text
// The editingDowncast converter handles adding the placeholder and its text to the editor view
// in the function createPlaceholderView()
function insertPlaceholder( editor, text ) {
	const model = editor.model;

	model.change( writer => {
		const placeholder = writer.createElement( 'placeholder', {
			type: text
		} );

		model.insertContent( placeholder );
		writer.setSelection( placeholder, 'on' );
	} );
}

// Create placeholder element with text and insert into the editor view
function createPlaceholderView( modelItem, viewWriter ) {
	const widgetElement = viewWriter.createContainerElement( 'placeholder' );
	const viewText = viewWriter.createText(
		'{{' + modelItem.getAttribute( 'type' ) + '}}'
	);

	viewWriter.insert( viewWriter.createPositionAt( widgetElement, 0 ), viewText );
	return widgetElement;
}
