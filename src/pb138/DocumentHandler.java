package pb138;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.handler.AbstractHandler;

/**
 * 
 * 
 * @author Jozef Mikusinec
 */
class DocumentHandler extends AbstractHandler {
    private final LibraryEditor editor;
    
    public DocumentHandler(LibraryEditor editor) {
        this.editor = editor;
    }
    
    @Override
    public void handle(String target,
            Request base,
            HttpServletRequest req,
            HttpServletResponse res
    ) throws IOException, ServletException {
        if (!req.getMethod().equals("GET")) {
            res.sendError(405);
        }
        
        if (!target.equals("/")) {
            res.sendError(404);
        }
        
        res.setContentType("text/xml; charset=utf-8");
        // TODO - move http://localhost:3000 to some config file
        res.addHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        res.addHeader("Access-Control-Allow-Credentials", "true");
        res.addHeader("Access-Control-Allow-Methods", "GET");
        res.setStatus(HttpServletResponse.SC_OK);
        res.getWriter().println(editor.returnDocument());
        
        base.setHandled(true);
    }
}
