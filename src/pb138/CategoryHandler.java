package pb138;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.handler.AbstractHandler;

/**
 * Handles requests starting with "category/".
 */
public class CategoryHandler extends AbstractHandler {
    private LibraryEditor editor;
    
    public CategoryHandler(LibraryEditor editor) {
        this.editor = editor;
    }
    
    @Override
    public void handle(String target,
            Request base,
            HttpServletRequest req,
            HttpServletResponse res
    ) throws IOException, ServletException {
        String[] params = target.split("/");
        
        boolean success;
        
        switch (req.getMethod()) {
            case "PUT":
                if (params.length != 2) {
                    res.sendError(405);
                    
                    return;
                }
                
                success = editor.addCategory(params[1]);
                
                break;
            case "PATCH":
                if (params.length != 3) {
                    res.sendError(405);
                    
                    return;
                }
                
                success = editor.renameCategory(params[1], params[2]);
                break;
            case "DELETE":
                if (params.length != 2) {
                    res.sendError(405);
                    
                    return;
                }
                
                success = editor.removeCategory(params[1]);
                break;
            default:
                res.sendError(405);
                return;
        }
        
        if (success) {
            res.setStatus(200);
        } else res.sendError(400);
    }
}