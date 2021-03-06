package pb138;

import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.ContextHandler;
import org.eclipse.jetty.server.handler.ContextHandlerCollection;
import org.eclipse.jetty.server.handler.ResourceHandler;

/**
 * Main class. Sets up server.
 */
public class Main {
    private static final LibraryEditor editor = new LibraryEditor();
    
    public static void main( String[] args ) throws Exception
    {
        Server server = new Server(8080);
        
        // Handles 'category' requests.
        ContextHandler ctxCategory = new ContextHandler("/api/category");
        ctxCategory.setHandler(new CategoryHandler(editor));
        
        // Handles 'record' requests.
        ContextHandler ctxRecord = new ContextHandler("/api/record");
        ctxRecord.setHandler(new RecordHandler(editor));
        
        // Handles requests to /api/document.
        ContextHandler ctxDocument = new ContextHandler("/api/document");
        ctxDocument.setHandler(new DocumentHandler(editor));
        
        // Serves static files from 'www/'
        ResourceHandler resourceHandler = new ResourceHandler();
        resourceHandler.setWelcomeFiles(new String[]{ "index.html" });
        resourceHandler.setResourceBase("www/build/");
        
        // Wrapper for 'resourceHandler'.
        ContextHandler ctxFiles = new ContextHandler("/");
        ctxFiles.setHandler(resourceHandler);
        
        // Collection of all handlers
        ContextHandlerCollection contexts = new ContextHandlerCollection();
        contexts.setHandlers(new Handler[] {
            ctxCategory,
            ctxRecord,
            ctxDocument,
            ctxFiles,
        });
        
        // Add handlers to server and start the server.
        server.setHandler(contexts);
        server.start();
        server.join();
    }
}
